#!/usr/bin/env python3
"""
SQLite ADB Database Query Tool
Connects to SQLite database on Android device through ADB and executes queries.
"""

import sys
import argparse
import subprocess
import json
import tempfile
import os
import shutil
from typing import Optional, List, Dict, Any, Tuple
import sqlite3
from pathlib import Path

# Set UTF-8 encoding for Windows
if sys.platform.startswith('win'):
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

class SQLiteADBQueryTool:
    def __init__(self, package_name: str = "com.multiplex.winit", db_name: str = "WINITSQLite.db"):
        """
        Initialize the SQLite ADB query tool.
        
        Args:
            package_name: Android package name
            db_name: SQLite database filename
        """
        self.package_name = package_name
        self.db_name = db_name
        self.local_db_path = None
        
    def check_adb_connection(self) -> bool:
        """
        Check if ADB is available and device is connected.
        
        Returns:
            bool: True if ADB is working, False otherwise
        """
        try:
            result = subprocess.run(['adb', 'devices'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode != 0:
                print("❌ ADB command failed. Make sure ADB is installed and in PATH.")
                return False
            
            lines = result.stdout.strip().split('\n')[1:]  # Skip header
            connected_devices = [line for line in lines if line.strip() and 'device' in line]
            
            if not connected_devices:
                print("❌ No Android devices connected via ADB.")
                print("   Make sure USB debugging is enabled and device is connected.")
                return False
            
            print(f"✅ Found {len(connected_devices)} connected device(s):")
            for device in connected_devices:
                print(f"   {device}")
            return True
            
        except subprocess.TimeoutExpired:
            print("❌ ADB command timed out.")
            return False
        except FileNotFoundError:
            print("❌ ADB not found. Make sure Android SDK is installed and ADB is in PATH.")
            return False
    
    def check_database_exists(self) -> bool:
        """
        Check if the SQLite database exists on the device.
        
        Returns:
            bool: True if database exists, False otherwise
        """
        try:
            # Try multiple possible locations
            db_locations = [
                f"databases/{self.db_name}",
                f"files/{self.db_name}"
            ]
            
            for db_path in db_locations:
                result = subprocess.run(['adb', 'shell', f'run-as {self.package_name} ls {db_path}'], 
                                      capture_output=True, text=True, timeout=10)
                
                if result.returncode == 0 and self.db_name in result.stdout:
                    print(f"✅ Database found at: {db_path}")
                    return True
            
            print(f"❌ Database not found in any expected location")
            return False
                
        except subprocess.TimeoutExpired:
            print("❌ ADB command timed out.")
            return False
    
    def find_database_path(self) -> Optional[str]:
        """
        Find the actual path of the database on the device.
        
        Returns:
            str: Database path if found, None otherwise
        """
        try:
            # Try multiple possible locations
            db_locations = [
                f"databases/{self.db_name}",
                f"files/{self.db_name}"
            ]
            
            for db_path in db_locations:
                result = subprocess.run(['adb', 'shell', f'run-as {self.package_name} ls {db_path}'], 
                                      capture_output=True, text=True, timeout=10)
                
                if result.returncode == 0 and self.db_name in result.stdout:
                    return db_path
            
            return None
                
        except subprocess.TimeoutExpired:
            return None
    
    def pull_database(self) -> bool:
        """
        Pull the database from device to local temporary file.
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Find the database path
            db_path = self.find_database_path()
            if not db_path:
                print("❌ Could not find database on device")
                return False
            
            self.device_db_path = db_path  # Store for push operation
            
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(suffix='.db', delete=False)
            self.local_db_path = temp_file.name
            temp_file.close()
            
            print(f"📥 Pulling database from device...")
            print(f"   Source: {db_path}")
            print(f"   Destination: {self.local_db_path}")
            
            # Use exec-out to directly get the database content
            result = subprocess.run([
                'adb', 'exec-out', f'run-as {self.package_name} cat {db_path}'
            ], capture_output=True, timeout=60)
            
            if result.returncode == 0:
                # Write the binary data to the local file
                with open(self.local_db_path, 'wb') as f:
                    f.write(result.stdout)
                
                file_size = os.path.getsize(self.local_db_path)
                print(f"✅ Database pulled successfully ({file_size:,} bytes)")
                return True
            else:
                print(f"❌ Failed to pull database: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("❌ ADB exec-out command timed out.")
            return False
        except Exception as e:
            print(f"❌ Error pulling database: {e}")
            return False
    
    def push_database(self) -> bool:
        """
        Push the modified database back to the Android device.
        
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.local_db_path or not os.path.exists(self.local_db_path):
            print("❌ No local database file to push.")
            return False
        
        if not hasattr(self, 'device_db_path') or not self.device_db_path:
            print("❌ Device database path not known. Pull database first.")
            return False
        
        try:
            print(f"📤 Pushing database back to device...")
            print(f"   Source: {self.local_db_path}")
            print(f"   Destination: {self.device_db_path}")
            
            # First, push to a temporary location accessible by shell
            temp_path = f"/data/local/tmp/{self.db_name}"
            
            # Push to temp location
            result = subprocess.run([
                'adb', 'push', self.local_db_path, temp_path
            ], capture_output=True, text=True, timeout=60)
            
            if result.returncode != 0:
                print(f"❌ Failed to push to temp location: {result.stderr}")
                return False
            
            # Copy from temp to app's private directory with proper permissions
            result = subprocess.run([
                'adb', 'shell', 
                f'run-as {self.package_name} cp {temp_path} {self.device_db_path}'
            ], capture_output=True, text=True, timeout=60)
            
            if result.returncode != 0:
                print(f"❌ Failed to copy to app directory: {result.stderr}")
                # Clean up temp file
                subprocess.run(['adb', 'shell', f'rm {temp_path}'], capture_output=True)
                return False
            
            # Clean up temp file
            subprocess.run(['adb', 'shell', f'rm {temp_path}'], capture_output=True)
            
            print(f"✅ Database pushed successfully")
            return True
            
        except subprocess.TimeoutExpired:
            print("❌ ADB command timed out.")
            return False
        except Exception as e:
            print(f"❌ Error pushing database: {e}")
            return False
    
    def get_table_list(self) -> List[str]:
        """
        Get list of all tables in the database.
        
        Returns:
            List of table names
        """
        query = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
        results = self.execute_query(query)
        
        if results:
            return [row['name'] for row in results]
        return []
    
    def get_table_info(self, table_name: str) -> List[Dict[str, Any]]:
        """
        Get detailed information about a table structure.
        
        Args:
            table_name: Name of the table
            
        Returns:
            List of column information dictionaries
        """
        query = f"PRAGMA table_info({table_name});"
        return self.execute_query(query) or []
    
    def get_table_count(self, table_name: str) -> int:
        """
        Get row count for a table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            Number of rows in the table
        """
        query = f"SELECT COUNT(*) as count FROM {table_name};"
        results = self.execute_query(query)
        
        if results:
            return results[0]['count']
        return 0
    
    def execute_query(self, query: str, limit: Optional[int] = None) -> Optional[List[Dict[str, Any]]]:
        """
        Execute a SQL query on the local database copy.
        
        Args:
            query: SQL query to execute
            limit: Optional limit for SELECT queries
            
        Returns:
            List of dictionaries containing query results, or None if error
        """
        if not self.local_db_path or not os.path.exists(self.local_db_path):
            print("❌ No local database file. Call pull_database() first.")
            return None
        
        try:
            # Add LIMIT clause if specified and not already present
            if limit and 'LIMIT' not in query.upper() and query.strip().upper().startswith('SELECT'):
                query = f"{query.rstrip(';')} LIMIT {limit};"
            
            conn = sqlite3.connect(self.local_db_path)
            conn.row_factory = sqlite3.Row  # Enable dict-like access
            cursor = conn.cursor()
            
            cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                # Convert to list of dictionaries
                return [dict(row) for row in results]
            else:
                conn.commit()
                affected_rows = cursor.rowcount
                print(f"✅ Query executed successfully. {affected_rows} rows affected.")
                return None
                
        except sqlite3.Error as e:
            print(f"❌ SQLite error: {e}")
            return None
        finally:
            if 'conn' in locals():
                conn.close()
    
    def cleanup(self):
        """Clean up temporary database file."""
        if self.local_db_path and os.path.exists(self.local_db_path):
            try:
                os.unlink(self.local_db_path)
                print("🧹 Temporary database file cleaned up")
            except Exception as e:
                print(f"⚠️  Warning: Could not clean up temporary file: {e}")
    
    def print_table_data(self, table_name: str, limit: int = 20, offset: int = 0):
        """
        Print formatted table data.
        
        Args:
            table_name: Name of the table
            limit: Number of rows to display
            offset: Number of rows to skip
        """
        # Get table structure
        columns = self.get_table_info(table_name)
        if not columns:
            print(f"❌ Could not get table structure for {table_name}")
            return
        
        # Get data
        query = f"SELECT * FROM {table_name} LIMIT {limit} OFFSET {offset};"
        data = self.execute_query(query)
        
        if data is None:
            print(f"❌ Could not fetch data from {table_name}")
            return
        
        if not data:
            print(f"📭 No data found in table {table_name}")
            return
        
        # Print table header
        print(f"\n📊 Table: {table_name}")
        print(f"📈 Showing {len(data)} rows (offset: {offset})")
        print("=" * 80)
        
        # Print column headers
        headers = [col['name'] for col in columns]
        header_str = " | ".join(f"{h:<15}" for h in headers)
        print(header_str)
        print("-" * len(header_str))
        
        # Print data rows
        for row in data:
            row_str = " | ".join(f"{str(row.get(h, '')):<15}" for h in headers)
            print(row_str)
        
        print("=" * 80)
    
    def export_to_csv(self, table_name: str, output_file: str, limit: Optional[int] = None):
        """
        Export table data to CSV file.
        
        Args:
            table_name: Name of the table
            output_file: Output CSV file path
            limit: Optional row limit
        """
        import csv
        
        # Get table structure
        columns = self.get_table_info(table_name)
        if not columns:
            print(f"❌ Could not get table structure for {table_name}")
            return
        
        # Get data
        query = f"SELECT * FROM {table_name}"
        if limit:
            query += f" LIMIT {limit}"
        query += ";"
        
        data = self.execute_query(query)
        
        if data is None:
            print(f"❌ Could not fetch data from {table_name}")
            return
        
        try:
            with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = [col['name'] for col in columns]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                
                writer.writeheader()
                for row in data:
                    writer.writerow(row)
            
            print(f"✅ Exported {len(data)} rows to {output_file}")
            
        except Exception as e:
            print(f"❌ Error exporting to CSV: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="SQLite ADB Database Query Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List all tables
  python sqlite-adb-query-tool.py --list-tables
  
  # Show table structure
  python sqlite-adb-query-tool.py --table-info users
  
  # Execute custom query
  python sqlite-adb-query-tool.py --query "SELECT * FROM users LIMIT 5"
  
  # Show table data
  python sqlite-adb-query-tool.py --show-table users --limit 10
  
  # Export table to CSV
  python sqlite-adb-query-tool.py --export users --output users.csv
        """
    )
    
    parser.add_argument('--package', default='com.multiplex.winit',
                       help='Android package name (default: com.multiplex.winit)')
    parser.add_argument('--db-name', default='WINITSQLite.db',
                       help='Database filename (default: WINITSQLite.db)')
    
    # Action arguments
    parser.add_argument('--list-tables', action='store_true',
                       help='List all tables in the database')
    parser.add_argument('--table-info', metavar='TABLE',
                       help='Show table structure')
    parser.add_argument('--query', metavar='SQL',
                       help='Execute custom SQL query')
    parser.add_argument('--show-table', metavar='TABLE',
                       help='Show table data')
    parser.add_argument('--export', metavar='TABLE',
                       help='Export table to CSV')
    parser.add_argument('--output', metavar='FILE',
                       help='Output file for export (default: table_name.csv)')
    parser.add_argument('--limit', type=int, default=20,
                       help='Row limit for queries (default: 20)')
    parser.add_argument('--offset', type=int, default=0,
                       help='Row offset for queries (default: 0)')
    parser.add_argument('--push', action='store_true',
                       help='Push modified database back to device after query execution')
    
    args = parser.parse_args()
    
    # Initialize tool
    tool = SQLiteADBQueryTool(args.package, args.db_name)
    
    try:
        # Check ADB connection
        if not tool.check_adb_connection():
            sys.exit(1)
        
        # Check if database exists
        if not tool.check_database_exists():
            print(f"❌ Database not found. Make sure the app is installed and has been run at least once.")
            sys.exit(1)
        
        # Pull database
        if not tool.pull_database():
            sys.exit(1)
        
        # Execute requested action
        if args.list_tables:
            print("\n📋 Available Tables:")
            print("=" * 40)
            tables = tool.get_table_list()
            for table in tables:
                count = tool.get_table_count(table)
                print(f"  {table:<30} ({count:,} rows)")
        
        elif args.table_info:
            print(f"\n📋 Table Structure: {args.table_info}")
            print("=" * 60)
            columns = tool.get_table_info(args.table_info)
            if columns:
                print(f"{'Column':<20} {'Type':<15} {'Nullable':<10} {'Primary Key':<12}")
                print("-" * 60)
                for col in columns:
                    nullable = "YES" if col['notnull'] == 0 else "NO"
                    pk = "YES" if col['pk'] == 1 else "NO"
                    print(f"{col['name']:<20} {col['type']:<15} {nullable:<10} {pk:<12}")
            else:
                print(f"❌ Table '{args.table_info}' not found")
        
        elif args.query:
            print(f"\n🔍 Executing Query:")
            print(f"SQL: {args.query}")
            print("=" * 60)
            results = tool.execute_query(args.query, args.limit)
            if results is not None:
                if results:
                    # Print results in table format
                    headers = list(results[0].keys())
                    header_str = " | ".join(f"{h:<15}" for h in headers)
                    print(header_str)
                    print("-" * len(header_str))
                    for row in results:
                        row_str = " | ".join(f"{str(row.get(h, '')):<15}" for h in headers)
                        print(row_str)
                    print(f"\n📊 Total rows: {len(results)}")
                else:
                    print("📭 No results returned")
        
        elif args.show_table:
            tool.print_table_data(args.show_table, args.limit, args.offset)
        
        elif args.export:
            output_file = args.output or f"{args.export}.csv"
            tool.export_to_csv(args.export, output_file, args.limit)
        
        else:
            # Default: show database overview
            print("\n📊 Database Overview")
            print("=" * 40)
            tables = tool.get_table_list()
            print(f"Total tables: {len(tables)}")
            
            if tables:
                print("\n📋 Tables with row counts:")
                for table in tables:
                    count = tool.get_table_count(table)
                    print(f"  {table:<30} ({count:,} rows)")
        
        # Push database back if requested
        if args.push and args.query:
            if tool.push_database():
                print("\n✅ Changes have been pushed back to the device")
            else:
                print("\n❌ Failed to push changes back to the device")
    
    except KeyboardInterrupt:
        print("\n\n⏹️  Operation cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
    finally:
        tool.cleanup()

if __name__ == "__main__":
    main() 