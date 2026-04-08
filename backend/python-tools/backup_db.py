#!/usr/bin/env python3
"""
PostgreSQL backup tool — local pg_dump or SSH-based remote dump.
Usage:
    python backup_db.py --mode local       # pg_dump on this machine
    python backup_db.py --mode ssh         # pg_dump via SSH to OCI VM
    python backup_db.py --keep 7           # keep only last 7 backups (default)
"""
import argparse
import subprocess
import os
import sys
from datetime import datetime
from pathlib import Path

BACKUP_DIR = Path(__file__).resolve().parent.parent / "backups"
DB_HOST = "140.245.230.142"
DB_PORT = "5432"
DB_NAME = "algomy_db"
DB_USER = "algomy"
DB_PASS = "AlgomyDB2026secure"
SSH_KEY = os.path.expanduser("~/Downloads/ssh-key-2026-03-04 (1).key")


def backup_local():
    """Run pg_dump locally (requires psql client installed)."""
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out = BACKUP_DIR / f"algomy_db_{ts}.sql.gz"
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASS

    cmd = f"pg_dump -h {DB_HOST} -p {DB_PORT} -U {DB_USER} -d {DB_NAME} --no-owner --no-acl | gzip > {out}"
    print(f"Running local pg_dump -> {out}")
    result = subprocess.run(cmd, shell=True, env=env, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        sys.exit(1)

    size_mb = out.stat().st_size / (1024 * 1024)
    print(f"Backup complete: {out} ({size_mb:.2f} MB)")
    return out


def backup_ssh():
    """Run pg_dump via SSH on the OCI VM and download."""
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    remote_path = f"/tmp/algomy_db_{ts}.sql.gz"
    local_path = BACKUP_DIR / f"algomy_db_{ts}.sql.gz"
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    ssh_base = f'ssh -i "{SSH_KEY}" -o StrictHostKeyChecking=no opc@{DB_HOST}'

    # Dump on remote
    dump_cmd = f'{ssh_base} "sudo -u postgres pg_dump {DB_NAME} --no-owner --no-acl | gzip > {remote_path}"'
    print(f"Running remote pg_dump via SSH...")
    result = subprocess.run(dump_cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"SSH dump error: {result.stderr}")
        sys.exit(1)

    # Download
    scp_cmd = f'scp -i "{SSH_KEY}" -o StrictHostKeyChecking=no opc@{DB_HOST}:{remote_path} {local_path}'
    print("Downloading backup...")
    result = subprocess.run(scp_cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"SCP error: {result.stderr}")
        sys.exit(1)

    # Cleanup remote
    subprocess.run(f'{ssh_base} "rm -f {remote_path}"', shell=True)

    size_mb = local_path.stat().st_size / (1024 * 1024)
    print(f"Backup complete: {local_path} ({size_mb:.2f} MB)")
    return local_path


def cleanup(keep: int):
    """Remove old backups, keeping the most recent `keep`."""
    if not BACKUP_DIR.exists():
        return
    backups = sorted(BACKUP_DIR.glob("algomy_db_*.sql.gz"), reverse=True)
    for old in backups[keep:]:
        old.unlink()
        print(f"Removed old backup: {old.name}")


def main():
    parser = argparse.ArgumentParser(description="Backup Algomy PostgreSQL database")
    parser.add_argument("--mode", choices=["local", "ssh"], default="local")
    parser.add_argument("--keep", type=int, default=7, help="Number of backups to retain")
    args = parser.parse_args()

    if args.mode == "local":
        backup_local()
    else:
        backup_ssh()

    cleanup(args.keep)
    print("Done.")


if __name__ == "__main__":
    main()
