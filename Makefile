.PHONY: fdev bdev install help

# Default target when just running 'make'
help:
	@echo "Available commands:"
	@echo "  make fdev   - Start frontend development server"
	@echo "  make bdev   - Start backend development server"
	@echo "  make install - Install all dependencies"
	@echo "  make help   - Show this help message"

# Frontend development
fdev:
	@echo "Starting frontend development server..."
	@cd frontend && pnpm dev

# Backend development
bdev:
	@echo "Starting backend development server..."
	@pnpm dev

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	@pnpm install
	@echo "Installing frontend dependencies..."
	@cd frontend && pnpm install
	@echo "Installing Python dependencies..."
	@cd scripts && pip install -r requirements.txt
