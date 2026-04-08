#!/usr/bin/env python3
"""
Lock a database table to simulate database contention/timeout for testing RabbitMQ retry mechanism.

Usage:
    python lock-table.py <seconds> [table_name]

Examples:
    python lock-table.py 120                          # Lock expiry_check_execution for 120 seconds
    python lock-table.py 180 beat_history             # Lock beat_history for 180 seconds
    python lock-table.py 90 planogram_execution_header # Lock planogram_execution_header for 90 seconds
"""
import psycopg2
import time
import sys
import argparse

# Database connection string
CONNECTION_STRING = "host=ep-morning-meadow-aitu71a4.c-4.us-east-1.aws.neon.tech port=5432 dbname=neondb user=neondb_owner password=npg_1pFrbPX8AQsV sslmode=require"

# Default table to lock
DEFAULT_TABLE = "expiry_check_execution"

def lock_table(seconds: int, table_name: str):
    """Lock the specified table for the given number of seconds."""

    print(f"\n{'='*60}")
    print(f"  DATABASE TABLE LOCK UTILITY")
    print(f"{'='*60}")
    print(f"  Table:    {table_name}")
    print(f"  Duration: {seconds} seconds")
    print(f"  Timeout:  60 seconds (command timeout in connection string)")
    print(f"{'='*60}\n")

    if seconds <= 60:
        print("[WARNING] Lock duration <= 60 seconds may not trigger timeout!")
        print("          The API has a 60-second command timeout.")
        print("          Consider using a longer duration (e.g., 120+ seconds).\n")

    try:
        print("[1/4] Connecting to database...")
        conn = psycopg2.connect(CONNECTION_STRING)
        conn.autocommit = False
        cursor = conn.cursor()
        print("      Connected successfully.\n")

        print("[2/4] Starting transaction and acquiring lock...")
        cursor.execute("BEGIN;")
        cursor.execute(f"LOCK TABLE {table_name} IN ACCESS EXCLUSIVE MODE;")
        print(f"      Lock acquired on '{table_name}'.\n")

        print("[3/4] Holding lock - TEST THE API NOW!")
        print(f"      The table is locked for {seconds} seconds.")
        print(f"      Any INSERT/UPDATE/DELETE on '{table_name}' will wait.\n")

        # Countdown
        for i in range(seconds, 0, -1):
            mins, secs = divmod(i, 60)
            timer = f"{mins:02d}:{secs:02d}"
            print(f"\r      Time remaining: {timer} ", end="", flush=True)
            time.sleep(1)

        print("\n\n[4/4] Releasing lock...")
        conn.rollback()
        cursor.close()
        conn.close()
        print("      Lock released. Database is accessible again.\n")
        print("[DONE] Test completed successfully.")

    except KeyboardInterrupt:
        print("\n\n[INTERRUPTED] Releasing lock early...")
        try:
            conn.rollback()
            cursor.close()
            conn.close()
            print("              Lock released.")
        except:
            pass
        sys.exit(0)

    except Exception as e:
        print(f"\n[ERROR] {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Lock a database table for testing RabbitMQ retry mechanism",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python lock-table.py 120                            # Lock default table for 2 minutes
  python lock-table.py 180 beat_history               # Lock beat_history for 3 minutes
  python lock-table.py 90 initiative_execution        # Lock initiative_execution for 90 seconds

Common tables in master_queue:
  - expiry_check_execution (default)
  - expiry_check_execution_line
  - beat_history
  - store_history
  - user_journey
  - initiative_execution
  - task
  - planogram_execution_header
  - planogram_execution_detail
        """
    )

    parser.add_argument(
        "seconds",
        type=int,
        help="Number of seconds to hold the lock (recommended: 120+ to trigger timeout)"
    )

    parser.add_argument(
        "table",
        nargs="?",
        default=DEFAULT_TABLE,
        help=f"Table name to lock (default: {DEFAULT_TABLE})"
    )

    args = parser.parse_args()

    if args.seconds <= 0:
        print("[ERROR] Duration must be a positive number")
        sys.exit(1)

    lock_table(args.seconds, args.table)

if __name__ == "__main__":
    main()
