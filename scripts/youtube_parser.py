from bs4 import BeautifulSoup
import json
from datetime import datetime
import re

def parse_youtube_history(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    videos = []
    for entry in soup.find_all('div', class_='content-cell'):
        title_elem = entry.find('a')
        if not title_elem:
            continue
            
        title = title_elem.text.strip()
        url = title_elem['href']
        
        # Extract video ID from URL
        video_id = re.search(r'v=([^&]+)', url)
        if not video_id:
            continue
            
        timestamp = entry.find('div', class_='date').text.strip()
        
        videos.append({
            'title': title,
            'url': url,
            'videoId': video_id.group(1),
            'watchedAt': timestamp,
            'platform': 'youtube'
        })
    
    # Save to JSON
    with open('youtube_history.json', 'w') as f:
        json.dump(videos, f, indent=2)
    
    return len(videos)

if __name__ == '__main__':
    count = parse_youtube_history('watch-history.html')
    print(f"Extracted {count} videos") 