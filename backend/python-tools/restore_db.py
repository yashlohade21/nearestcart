#!/usr/bin/env python3
"""
PostgreSQL restore tool — restores from a backup file.
Usage:
    python restore_db.py backups/algomy_db_20260305_120000.sql.gz
    python restore_db.py --latest        # restore from most recent backup
    python restore_db.py --list          # list available backups
"""
import argparse
import subprocess
import os
import sys
from pathlib import Path

BACKUP_DIR = Path(__file__).resolve().parent.parent / "backups"
DB_HOST = "140.245.230.142"
DB_PORT = "5432"
DB_NAME = "algomy_db"
DB_USER = "algomy"
DB_PASS = "AlgomyDB2026secure"


def list_backups():
    """List available backups."""
    if not BACKUP_DIR.exists():
        print("No backups directory found.")
        return
    backups = sorted(BACKUP_DIR.glob("algomy_db_*.sql.gz"), reverse=True)
    if not backups:
        print("No backups found.")
        return
    print(f"\nAvailable backups ({len(backups)}):\n")
    for b in backups:
        size_mb = b.stat().st_size / (1024 * 1024)
        print(f"  {b.name}  ({size_mb:.2f} MB)")
    print()


def restore(backup_path: Path):
    """Restore from a gzipped SQL dump."""
    if not backup_path.exists():
        print(f"Error: {backup_path} not found")
        sys.exit(1)

    size_mb = backup_path.stat().st_size / (1024 * 1024)
    print(f"\nRestore target: {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
    print(f"Backup file:    {backup_path.name} ({size_mb:.2f} MB)")
    print(f"\nWARNING: This will overwrite data in {DB_NAME}.")

    confirm = input("Type 'yes' to confirm: ").strip().lower()
    if confirm != "yes":
        print("Aborted.")
        sys.exit(0)

    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASS

    cmd = f"gunzip -c {backup_path} | psql -h {DB_HOST} -p {DB_PORT} -U {DB_USER} -d {DB_NAME} --quiet"
    print(f"\nRestoring...")
    result = subprocess.run(cmd, shell=True, env=env, capture_output=True, text=True)

    if result.returncode != 0 and result.stderr:
        # psql often prints NOTICEs that aren't errors
        errors = [l for l in result.stderr.splitlines() if "ERROR" in l]
        if errors:
            print(f"Errors during restore:")
            for e in errors:
                print(f"  {e}")
        else:
            print("Restore completed (with notices).")
    else:
        print("Restore completed successfully.")


def main():
    parser = argparse.ArgumentParser(description="Restore Algomy PostgreSQL database")
    parser.add_argument("backup_file", nargs="?", help="Path to backup .sql.gz file")
    parser.add_argument("--latest", action="store_true", help="Restore from most recent backup")
    parser.add_argument("--list", action="store_true", help="List available backups")
    args = parser.parse_args()

    if args.list:
        list_backups()
        return

    if args.latest:
        if not BACKUP_DIR.exists():
            print("No backups directory.")
            sys.exit(1)
        backups = sorted(BACKUP_DIR.glob("algomy_db_*.sql.gz"), reverse=True)
        if not backups:
            print("No backups found.")
            sys.exit(1)
        restore(backups[0])
        return

    if args.backup_file:
        restore(Path(args.backup_file))
        return

    parser.print_help()


if __name__ == "__main__":
    main()
