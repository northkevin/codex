import os
import json
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize YouTube API client
youtube = build('youtube', 'v3', developerKey=os.getenv('YOUTUBE_API_KEY'))

def load_video_ids():
    with open('videos.json', 'r') as f:
        videos = json.load(f)
        return [video['video_id'] for video in videos]

def fetch_video_details():
    video_ids = load_video_ids()
    
    try:
        response = youtube.videos().list(
            part='contentDetails,id,liveStreamingDetails,localizations,'
                 'paidProductPlacementDetails,player,recordingDetails,'
                 'snippet,statistics,status,topicDetails',
            id=','.join(video_ids)
        ).execute()
        
        # Save raw response
        with open('list_videos_response.json', 'w') as f:
            json.dump(response, f, indent=2)
            
        print(f"Fetched details for {len(response.get('items', []))} videos")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__':
    fetch_video_details()