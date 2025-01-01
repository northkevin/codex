# YouTube History Parser

Scripts for parsing and processing YouTube watch history from Google Takeout data.

## Setup

1. Install requirements:
```bash
pip install -r requirements.txt
```


2. Place your Google Takeout watch history file in a known location (default: `./watch-history-snippet.html`)

## Testing & Development

### Testing the Parser (youtube_parser.py)
The core parsing logic has been tested with the sample data in `watch-history-snippet.html`. This file contains example entries that validate:

- Basic video entry parsing
- Proper whitespace handling in titles
- Timestamp parsing and ISO format conversion
- Channel information extraction
- URL and video ID parsing

To test just the parser with the sample data:
```bash
YOUTUBE_HISTORY_FILE=./watch-history-snippet.html python parse_youtube.py
```


### Testing Batch Processing
To test the batch processing with a limited number of entries:
```bash
YOUTUBE_HISTORY_FILE=/path/to/full/watch-history.html python parse_youtube.py
```

Uncomment this line in main() to test with a subset of entries:
```python
videos, invalid_entries = processor.process_history(batch_size=100, max_entries=1000)
```


## Validated Features

- [x] Basic entry parsing
- [x] Title whitespace normalization
- [x] Timestamp parsing and ISO format
- [x] Batch processing infrastructure
- [x] Progress monitoring
- [x] Invalid entry tracking

## Output Files

- `watch-history.json`: Final processed output
- `invalid-entries.txt`: Log of any entries that couldn't be parsed
- `batches/`: Temporary directory for batch processing (auto-cleaned)

## Next Steps

- [ ] Add validation for parsed entries
- [ ] Add statistics collection
- [ ] Add resume capability for interrupted processing