"""Core parsing logic for YouTube watch history entries."""
from bs4 import BeautifulSoup
from dateutil import parser
import re

def parse_single_entry(content_cell):
    """Parse a single content-cell div into a video entry."""
    try:
        # Find the first anchor tag (video link)
        video_link = content_cell.find('a')
        if not video_link:
            return None
            
        # Extract video URL and title, normalizing whitespace
        url = video_link.get('href', '')
        title = ' '.join(video_link.text.split())
        
        # Extract video ID from URL
        video_id_match = re.search(r'[?&]v=([^&]+)', url)
        video_id = video_id_match.group(1) if video_id_match else None
        
        # Find channel info (second anchor tag)
        channel_elem = content_cell.find_all('a')
        channel_info = channel_elem[1] if len(channel_elem) > 1 else None
        channel_title = channel_info.text.strip() if channel_info else None
        channel_url = channel_info.get('href', '') if channel_info else None
        
        # Extract timestamp - it's the text after the channel link
        watched_at = None
        if channel_info:
            timestamp_text = ''.join(text for text in channel_info.next_siblings if isinstance(text, str))
            timestamp_text = timestamp_text.strip()
            try:
                watched_at = parser.parse(timestamp_text).isoformat()
            except ValueError as e:
                print(f"Error parsing timestamp '{timestamp_text}': {e}")
        
        return {
            'title': title,
            'url': url,
            'video_id': video_id,
            'channel_title': channel_title,
            'channel_url': channel_url,
            'watched_at': watched_at,
            'platform': 'youtube'
        }
        
    except Exception as e:
        print(f"Error parsing entry: {e}")
        return None 