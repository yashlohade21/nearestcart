#!/usr/bin/env bash
# Shortcut from the repo root. Usage: ./backend.sh
exec bash "$(dirname "$0")/backend/run.sh" "$@"
