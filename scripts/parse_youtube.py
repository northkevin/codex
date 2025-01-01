"""Main script for processing YouTube watch history in batches."""
from pathlib import Path
import json
import os
from bs4 import BeautifulSoup
from tqdm import tqdm
import itertools
from youtube_parser import parse_single_entry

class HistoryProcessor:
    def __init__(self, html_path, output_dir=None):
        self.html_path = Path(html_path)
        self.output_dir = Path(output_dir or self.html_path.parent)
        self.batch_dir = self.output_dir / 'batches'
        self.batch_dir.mkdir(exist_ok=True)
        
    def process_history(self, batch_size=100, max_entries=None):
        """Process the history file in batches."""
        videos = []
        invalid_entries = []
        processed = 0
        
        print("Starting parse of history file...")
        
        # Read and parse HTML file
        with open(self.html_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
        
        total_cells = len(soup.find_all('div', class_='content-cell'))
        print(f"Found {total_cells} potential entries")
        
        cell_iterator = self._content_cell_iterator(soup)
        if max_entries:
            cell_iterator = itertools.islice(cell_iterator, max_entries)
        
        with tqdm(total=min(total_cells, max_entries or float('inf'))) as pbar:
            current_batch = []
            
            for cell in cell_iterator:
                entry = parse_single_entry(cell)
                if entry:
                    current_batch.append(entry)
                else:
                    invalid_entries.append(cell.text[:100] + "...")
                
                processed += 1
                pbar.update(1)
                
                if len(current_batch) >= batch_size:
                    self._save_batch(current_batch, processed)
                    videos.extend(current_batch)
                    current_batch = []
            
            if current_batch:
                self._save_batch(current_batch, processed)
                videos.extend(current_batch)
        
        return videos, invalid_entries
    
    def _content_cell_iterator(self, soup):
        """Iterate over content cells in the HTML."""
        for cell in soup.find_all('div', class_='content-cell'):
            if 'mdl-typography--body-1' in cell.get('class', []):
                yield cell
    
    def _save_batch(self, batch, processed_count):
        """Save a batch of entries to a temporary JSON file."""
        batch_file = self.batch_dir / f'watch-history-batch-{processed_count}.json'
        with open(batch_file, 'w', encoding='utf-8') as f:
            json.dump(batch, f, indent=2, ensure_ascii=False)
    
    def merge_batches(self, output_path):
        """Merge all batch files into final JSON file and cleanup."""
        all_videos = []
        batch_files = sorted(self.batch_dir.glob('watch-history-batch-*.json'))
        
        print(f"\nMerging {len(batch_files)} batch files...")
        for batch_file in tqdm(batch_files):
            with open(batch_file, 'r', encoding='utf-8') as f:
                all_videos.extend(json.load(f))
            batch_file.unlink()
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(all_videos, f, indent=2, ensure_ascii=False)
        
        # Cleanup batch directory if empty
        if not any(self.batch_dir.iterdir()):
            self.batch_dir.rmdir()

def main():
    history_path = Path(os.getenv('YOUTUBE_HISTORY_FILE', './watch-history-snippet.html'))
    
    if not history_path.exists():
        print(f"Error: File not found: {history_path}")
        print("Please set YOUTUBE_HISTORY_FILE environment variable to the path of your history file")
        return
    
    print(f"Reading from: {history_path}")
    
    processor = HistoryProcessor(history_path)
    
    # Process history (optionally with max_entries for testing)
    # videos, invalid_entries = processor.process_history(batch_size=100, max_entries=1000)
    videos, invalid_entries = processor.process_history(batch_size=100)
    
    # Save final output
    output_path = Path('./watch-history.json')
    processor.merge_batches(output_path)
    
    print(f"\nProcessed {len(videos)} valid entries")
    print(f"Found {len(invalid_entries)} invalid entries")
    print(f"Output saved to {output_path.absolute()}")
    
    # Save invalid entries for review
    if invalid_entries:
        with open('invalid-entries.txt', 'w', encoding='utf-8') as f:
            f.write('\n---\n'.join(invalid_entries))
        print(f"Invalid entries saved to invalid-entries.txt")

if __name__ == '__main__':
    main()