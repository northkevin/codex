import os
import json
import time
from typing import List, Dict, Any
from datetime import datetime, timedelta
import googleapiclient.discovery
from googleapiclient.errors import HttpError
import psycopg2
from psycopg2.extras import RealDictCursor

# Configure API
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
youtube = googleapiclient.discovery.build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

# Constants
BATCH_SIZE = 500  # Total videos per batch
IDS_PER_REQUEST = 50  # YouTube API limit
WAIT_TIME = 2  # Seconds between API calls
OUTPUT_FILE = 'scripts/data/youtube/youtube_data_processed.json'
ERROR_FILE = 'scripts/data/youtube/youtube_data_errors.json'

def get_video_ids() -> List[str]:
    """Get all video IDs from the database that need updating."""
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('POSTGRES_DB', 'codex_dev'),
            user=os.getenv('POSTGRES_USER', 'kevinnorth'),
            password=os.getenv('POSTGRES_PASSWORD', ''),
            host=os.getenv('POSTGRES_HOST', 'localhost')
        )
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get videos that:
            # 1. Haven't been updated in the last week
            # 2. Or have never been updated
            cur.execute("""
                SELECT video_id 
                FROM videos 
                WHERE metadata_updated_at IS NULL 
                   OR metadata_updated_at < %s
                ORDER BY metadata_updated_at ASC NULLS FIRST
            """, [datetime.utcnow() - timedelta(days=7)])
            
            results = cur.fetchall()
            return [row['video_id'] for row in results]
            
    except Exception as e:
        print(f"Database error: {e}")
        raise
    finally:
        if conn:
            conn.close()

def fetch_video_batch(video_ids: List[str]) -> List[Dict[Any, Any]]:
    """Fetch metadata for a batch of videos."""
    results = []
    
    # Split into smaller chunks for API
    for i in range(0, len(video_ids), IDS_PER_REQUEST):
        chunk = video_ids[i:i + IDS_PER_REQUEST]
        
        try:
            response = youtube.videos().list(
                part='snippet,contentDetails,statistics,status,topicDetails,recordingDetails,liveStreamingDetails',
                id=','.join(chunk)
            ).execute()
            
            # Process each video
            for item in response.get('items', []):
                video_data = {
                    'videoId': item['id'],
                    'title': item['snippet']['title'],
                    'description': item['snippet']['description'],
                    'thumbnailUrl': item['snippet'].get('thumbnails', {}).get('maxres', {}).get('url'),
                    'tags': item['snippet'].get('tags', []),
                    'categoryId': item['snippet'].get('categoryId'),
                    'audioLanguage': item['snippet'].get('defaultAudioLanguage'),
                    'duration': item['contentDetails']['duration'],
                    'licensedContent': item['contentDetails'].get('licensedContent'),
                    'viewCount': int(item['statistics'].get('viewCount', 0)),
                    'likeCount': int(item['statistics'].get('likeCount', 0)),
                    'commentCount': int(item['statistics'].get('commentCount', 0)),
                    'channelId': item['snippet']['channelId'],
                    'channelTitle': item['snippet']['channelTitle'],
                    'publishedAt': item['snippet']['publishedAt'],
                    
                    # Status details
                    'privacyStatus': item['status']['privacyStatus'],
                    'license': item['status'].get('license'),
                    'embeddable': item['status'].get('embeddable'),
                    
                    # Topic details
                    'topicCategories': item.get('topicDetails', {}).get('topicCategories', []),
                    
                    # Recording details
                    'recordingDate': item.get('recordingDetails', {}).get('recordingDate'),
                    'recordingLocation': item.get('recordingDetails', {}).get('location'),
                    
                    # Live streaming details
                    'wasLivestream': bool(item.get('liveStreamingDetails')),
                    'actualStartTime': item.get('liveStreamingDetails', {}).get('actualStartTime'),
                    'actualEndTime': item.get('liveStreamingDetails', {}).get('actualEndTime'),
                    
                    # Product placement
                    'hasPaidProductPlacement': item['contentDetails'].get('hasCustomThumbnail', False),
                    
                    # Update timestamp
                    'metadataUpdatedAt': datetime.utcnow().isoformat()
                }
                results.append(video_data)
            
            print(f"Fetched {len(chunk)} videos successfully")
            time.sleep(WAIT_TIME)  # Be nice to the API
            
        except HttpError as e:
            print(f"Error fetching videos: {e}")
            with open(ERROR_FILE, 'w') as f:
                json.dump({
                    'error': str(e),
                    'failed_ids': chunk,
                    'timestamp': datetime.utcnow().isoformat()
                }, f, indent=2)
            raise  # Exit early on API errors
    
    return results

def main():
    video_ids = get_video_ids()
    print(f"Found {len(video_ids)} videos to process")
    
    # Process in batches
    for i in range(0, len(video_ids), BATCH_SIZE):
        batch = video_ids[i:i + BATCH_SIZE]
        results = fetch_video_batch(batch)
        
        # Append results to file
        mode = 'w' if i == 0 else 'a'
        with open(OUTPUT_FILE, mode) as f:
            if i == 0:  # Start array
                f.write('[\n')
            for j, result in enumerate(results):
                json.dump(result, f, indent=2)
                if i + j < len(video_ids) - 1:  # Not last item
                    f.write(',\n')
            if i + BATCH_SIZE >= len(video_ids):  # End array
                f.write('\n]')
        
        print(f"Processed batch {i//BATCH_SIZE + 1} of {(len(video_ids) + BATCH_SIZE - 1)//BATCH_SIZE}")

if __name__ == '__main__':
    main()