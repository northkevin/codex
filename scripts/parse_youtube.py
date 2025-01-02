"""Parse YouTube watch history HTML file into JSON."""
from pathlib import Path
import json
import re
from datetime import datetime
from dateutil import parser
from bs4 import BeautifulSoup, SoupStrainer

# File paths
INPUT_FILE = "/Users/kevinnorth/Downloads/Takeout/YouTube and YouTube Music/history/watch-history.html"
OUTPUT_FILE = "watch-history.json"

# Make sure input file exists
if not Path(INPUT_FILE).exists():
    print(f"Error: Cannot find {INPUT_FILE}")
    exit(1)

print(f"Reading from: {INPUT_FILE}")
print(f"File size: {Path(INPUT_FILE).stat().st_size / (1024*1024):.2f} MB")

print("Parsing HTML file (this might take a minute)...")

# Only parse the divs we care about
parse_filter = SoupStrainer('div', class_=['outer-cell', 'mdl-grid', 'content-cell'])

# Parse the HTML file
with open(INPUT_FILE, 'r', encoding='utf-8') as f:
    # Use lxml parser for better performance
    soup = BeautifulSoup(f.read(), 'lxml', parse_only=parse_filter)

print("HTML parsing complete!")

video_entries = []

# 1. Get body tag and main grid
main_grid = soup.find('div', class_='mdl-grid')
if not main_grid:
    print("Error: No main grid found")
    exit(1)

# 3. Process each episode div
count = 0
for episode_div in main_grid.find_all('div', recursive=False):
    try:
        count += 1
        if count % 1000 == 0:
            print(f"Processed {count} entries...")

        # 4. Get the content div that has our video info (first content-cell)
        content = episode_div.select_one('div.mdl-grid > div.content-cell.mdl-typography--body-1')
        if not content:
            continue

        # 5. Extract video info using proven parsing logic
        video_link = content.find('a')
        if not video_link:
            continue

        # Extract video URL and title, normalizing whitespace
        url = video_link.get('href', '')
        title = ' '.join(video_link.text.split())

        # Extract video ID from URL
        video_id_match = re.search(r'[?&]v=([^&]+)', url)
        video_id = video_id_match.group(1) if video_id_match else None

        # Find channel info (second anchor tag)
        channel_elem = content.find_all('a')
        channel_info = channel_elem[1] if len(channel_elem) > 1 else None
        channel_title = channel_info.text.strip() if channel_info else None
        channel_url = channel_info.get('href', '') if channel_info else None

        # Extract timestamp - it's the text after the channel link
        watched_at = None
        if channel_info:
            timestamp_text = ''.join(text for text in channel_info.next_siblings if isinstance(text, str))
            timestamp_text = timestamp_text.strip()
            try:
                parsed_date = parser.parse(timestamp_text)
                if isinstance(parsed_date, datetime):
                    watched_at = parsed_date.isoformat()
                else:
                    watched_at = None
                    print(f"Warning: Could not parse timestamp '{timestamp_text}' into datetime")
            except ValueError as e:
                print(f"Error parsing timestamp '{timestamp_text}': {e}")

        video = {
            'title': title,
            'url': url,
            'video_id': video_id,
            'channel_title': channel_title,
            'channel_url': channel_url,
            'watched_at': watched_at,
            'platform': 'youtube'
        }

        # print(f"Found: {video['title']}")
        video_entries.append(video)

    except Exception as e:
        print(f"Failed to parse entry: {str(e)}")
        continue

# Save to JSON file
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(video_entries, f, indent=2, ensure_ascii=False)

print(f"\nProcessed {len(video_entries)} videos")
print(f"Output saved to {OUTPUT_FILE}")
