from bs4 import BeautifulSoup
from datetime import datetime
import json
import re
from pathlib import Path
import os
from dateutil import parser

def parse_single_entry(content_cell):
    """Parse a single content-cell div into a video entry."""
    try:
        # Find the first anchor tag (video link)
        video_link = content_cell.find('a')
        if not video_link:
            return None
            
        # Extract video URL and title
        url = video_link.get('href', '')
        title = video_link.text.strip()
        
        # Extract video ID from URL
        video_id_match = re.search(r'[?&]v=([^&]+)', url)
        video_id = video_id_match.group(1) if video_id_match else None
        
        # Find channel info (second anchor tag)
        channel_elem = content_cell.find_all('a')
        channel_info = channel_elem[1] if len(channel_elem) > 1 else None
        channel_title = channel_info.text.strip() if channel_info else None
        channel_url = channel_info.get('href', '') if channel_info else None
        
        # Extract timestamp
        timestamp_text = content_cell.get_text()
        timestamp_match = re.search(r'([A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2}:\d{2} [AP]M [A-Z]{3})', timestamp_text)
        watched_at = None
        if timestamp_match:
            # Parse the timestamp string to datetime object
            timestamp_str = timestamp_match.group(1)
            try:
                watched_at = parser.parse(timestamp_str).isoformat()
            except ValueError as e:
                print(f"Error parsing timestamp '{timestamp_str}': {e}")
        
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

def parse_history(html_path):
    """Parse YouTube watch history HTML file."""
    
    # Read HTML file
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    # Find all content cells
    content_cells = soup.find_all('div', class_='content-cell')
    
    # Process entries
    videos = []
    
    print(f"Found {len(content_cells)} potential entries")
    
    for cell in content_cells:
        # Skip non-video cells
        if 'mdl-typography--body-1' not in cell.get('class', []):
            continue
            
        entry = parse_single_entry(cell)
        if entry:
            videos.append(entry)
            
    return videos

def main():
    # Get file path from environment variable
    history_path = Path(os.getenv('YOUTUBE_HISTORY_FILE', './watch-history-snippet.html'))
    
    if not history_path.exists():
        print(f"Error: File not found: {history_path}")
        print("Please set YOUTUBE_HISTORY_FILE environment variable to the path of your history file")
        return
    
    print(f"Reading from: {history_path}")
    videos = parse_history(history_path)
    
    # Save to JSON
    output_path = Path('./watch-history.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(videos, f, indent=2, ensure_ascii=False)
    
    print(f"\nProcessed {len(videos)} entries")
    print(f"Output saved to {output_path.absolute()}")
    
    # Print all entries for verification
    print("\nParsed entries:")
    for video in videos:
        print(f"\nTitle: {video['title']}")
        print(f"Channel: {video['channel_title']}")
        print(f"Watched: {video['watched_at']}")

if __name__ == '__main__':
    main()