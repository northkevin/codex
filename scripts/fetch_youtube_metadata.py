import os
import json
import logging
from datetime import datetime
from pathlib import Path
from googleapiclient.discovery import build
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
MAX_VIDEOS_PER_REQUEST = 50

# File paths
DATA_DIR = Path('scripts/data')
YOUTUBE_DIR = DATA_DIR / 'youtube'
PROCESSED_DATA_FILE = YOUTUBE_DIR / 'youtube_data_processed.json'
ERROR_DATA_FILE = YOUTUBE_DIR / 'youtube_data_errors.json'

# Ensure directories exist
YOUTUBE_DIR.mkdir(parents=True, exist_ok=True)

# Load environment and initialize clients
load_dotenv()
youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor(cursor_factory=RealDictCursor)

def fetch_videos_needing_update():
    cur.execute("""
        SELECT video_id, title, channel_id 
        FROM videos
        WHERE metadata_updated_at IS NULL 
        LIMIT %s
    """, (MAX_VIDEOS_PER_REQUEST,))
    return cur.fetchall()

def extract_useful_data(video_item):
    if video_item['kind'] != 'youtube#video':
        return None
    
    snippet = video_item['snippet']
    content_details = video_item['contentDetails']
    statistics = video_item.get('statistics', {})
    status = video_item.get('status', {})
    
    return {
        'videoId': video_item['id'],
        'title': snippet['title'],
        'description': snippet.get('description'),
        'thumbnailUrl': snippet.get('thumbnails', {}).get('maxres', {}).get('url'),
        'tags': snippet.get('tags', []),
        'categoryId': snippet.get('categoryId'),
        'audioLanguage': snippet.get('defaultAudioLanguage'),
        'duration': content_details['duration'],
        'licensedContent': content_details.get('licensedContent'),
        'channelId': snippet['channelId'],
        'channelTitle': snippet['channelTitle'],
        'publishedAt': snippet['publishedAt'],
        
        # Statistics
        'viewCount': int(statistics.get('viewCount', 0)) if statistics.get('viewCount') else None,
        'likeCount': int(statistics.get('likeCount', 0)) if statistics.get('likeCount') else None,
        'commentCount': int(statistics.get('commentCount', 0)) if statistics.get('commentCount') else None,
        
        # Status
        'privacyStatus': status.get('privacyStatus'),
        'license': status.get('license'),
        'embeddable': status.get('embeddable'),
        
        # Topic Details
        'topicCategories': video_item.get('topicDetails', {}).get('topicCategories', []),
        
        # Recording Details
        'recordingDate': video_item.get('recordingDetails', {}).get('recordingDate'),
        'recordingLocation': video_item.get('recordingDetails', {}).get('location'),

        # Live Streaming Details
        'wasLivestream': bool(video_item.get('liveStreamingDetails')),
        'actualStartTime': video_item.get('liveStreamingDetails', {}).get('actualStartTime'),
        'actualEndTime': video_item.get('liveStreamingDetails', {}).get('actualEndTime'),

        # Paid Product Placement
        'hasPaidProductPlacement': video_item.get('paidProductPlacementDetails', {}).get('hasPaidProductPlacement'),
        
        'metadataUpdatedAt': datetime.utcnow().isoformat()
    }

def fetch_youtube_data(videos):
    youtube_data = []
    errors = []
    
    video_ids = [v['video_id'] for v in videos]
    logger.info(f"Fetching data for {len(video_ids)} videos")
    
    try:
        response = youtube.videos().list(
            part='snippet,contentDetails,statistics,status,topicDetails,recordingDetails,'
                 'liveStreamingDetails,paidProductPlacementDetails',
            id=','.join(video_ids)
        ).execute()
        
        for item in response.get('items', []):
            if processed := extract_useful_data(item):
                youtube_data.append(processed)
            else:
                errors.append({
                    'video_id': item['id'],
                    'error': 'Invalid video data format'
                })
                
    except Exception as e:
        errors.append({
            'video_ids': video_ids,
            'error': str(e)
        })
    
    if errors:
        with open(ERROR_DATA_FILE, 'w') as f:
            json.dump(errors, f, indent=2)
        
    return youtube_data

def main():
    videos = fetch_videos_needing_update()
    youtube_data = fetch_youtube_data(videos)
    
    with open(PROCESSED_DATA_FILE, 'w') as f:
        json.dump(youtube_data, f, indent=2)
    
    logger.info(f"Processed {len(youtube_data)} videos")
    if os.path.exists(ERROR_DATA_FILE):
        with open(ERROR_DATA_FILE) as f:
            errors = json.load(f)
            if errors:
                logger.warning(f"Encountered {len(errors)} errors")

if __name__ == '__main__':
    main()
    cur.close()
    conn.close()