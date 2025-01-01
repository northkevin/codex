"""Main script for processing YouTube watch history in batches."""
from pathlib import Path
import json
import os
from bs4 import BeautifulSoup, SoupStrainer
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
        """Process the history file in batches using targeted parsing."""
        # Add validation at the start
        file_size = self.html_path.stat().st_size
        if file_size == 0:
            raise ValueError("History file is empty")
        
        print(f"File size: {file_size / (1024*1024):.2f} MB")
        
        # Quick validation of file content
        with open(self.html_path, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
            if not first_line.startswith('<!DOCTYPE html>'):
                print("Warning: File doesn't start with DOCTYPE declaration - might not be valid HTML")
        
        videos = []
        invalid_entries = []
        processed = 0
        
        print("Starting parse of history file...")
        
        # Only parse div elements with specific classes we care about
        parse_filter = SoupStrainer('div', class_=['content-cell', 'mdl-typography--body-1'])
        
        print("Parsing HTML file (this might take a moment)...")
        with open(self.html_path, 'r', encoding='utf-8') as f:
            # Use lxml parser for better performance
            soup = BeautifulSoup(f.read(), 'html.parser', parse_only=parse_filter)
        
        # Find all relevant divs that match our criteria
        content_cells = soup.find_all(lambda tag: tag.name == 'div' 
                                     and 'content-cell' in tag.get('class', [])
                                     and 'mdl-typography--body-1' in tag.get('class', []))
        
        total_cells = len(content_cells)
        print(f"Found {total_cells} relevant entries to process")
        
        cell_iterator = content_cells
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
    
    def test_parse(self, num_entries=5):
        """Test parse a small number of entries to verify everything works."""
        from bs4 import BeautifulSoup, SoupStrainer
        
        parse_filter = SoupStrainer('div', class_=['content-cell', 'mdl-typography--body-1'])
        
        print(f"Testing parse with {num_entries} entries...")
        with open(self.html_path, 'r', encoding='utf-8') as f:
            content = f.read(50000)  # Read first 50KB
            soup = BeautifulSoup(content, 'html.parser', parse_only=parse_filter)
            
            cells = soup.find_all(lambda tag: tag.name == 'div' 
                                and 'content-cell' in tag.get('class', [])
                                and 'mdl-typography--body-1' in tag.get('class', []))
            
            if not cells:
                raise ValueError("No valid entries found in test parse")
            
            print(f"Found {len(cells)} entries in test parse")
            for cell in cells[:num_entries]:
                entry = parse_single_entry(cell)
                if entry:
                    print(f"Successfully parsed: {entry.get('title', 'Unknown Title')}")
                else:
                    print("Failed to parse entry")

def main():
    history_path = Path(os.getenv('YOUTUBE_HISTORY_FILE', './watch-history.html'))
    test_mode = os.getenv('TEST_MODE', 'false').lower() == 'true'
    
    if test_mode:
        history_path = Path('./watch-history-sample.html')
    
    if not history_path.exists():
        print(f"Error: File not found: {history_path}")
        if test_mode:
            print("Please create a sample file first using create_test_sample.py")
        else:
            print("Please set YOUTUBE_HISTORY_FILE environment variable to the path of your history file")
            print("Or set TEST_MODE=true to use a sample file")
        return
    
    print(f"Reading from: {history_path}")
    print(f"File size: {history_path.stat().st_size / (1024*1024):.2f} MB")
    
    processor = HistoryProcessor(history_path)
    
    # Test parse first
    try:
        processor.test_parse(5)
    except Exception as e:
        print(f"Test parse failed: {e}")
        return
    
    # If test parse succeeds, proceed with full processing
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