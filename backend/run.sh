#!/usr/bin/env bash
# Start the FastAPI backend for local development.
# Usage:  ./run.sh   (from backend/)  OR  bash backend/run.sh  (from repo root)

set -e
cd "$(dirname "$0")"
exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
