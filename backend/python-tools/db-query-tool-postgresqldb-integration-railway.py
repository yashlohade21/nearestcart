#!/usr/bin/env python3
"""
PostgreSQL Database Query Tool
Connects to PostgreSQL database and executes queries passed as command line parameters.
"""

import sys
import os
import argparse
import psycopg2
from psycopg2 import Error
from psycopg2.extras import RealDictCursor
import json
from typing import Optional, List, Dict, Any

# Set UTF-8 encoding for Windows
if sys.platform.startswith('win'):
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

class PostgreSQLQueryTool:
    def __init__(self, connection_string: str):
        """
        Initialize the PostgreSQL query tool with connection string.
        
        Args:
            connection_string: PostgreSQL connection string
        """
        self.connection_string = connection_string
        self.connection = None
        
    def connect(self) -> bool:
        """
        Establish connection to PostgreSQL database.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            self.connection = psycopg2.connect(self.connection_string)
            print("[SUCCESS] Successfully connected to PostgreSQL database")
            return True
        except Error as e:
            print(f"[ERROR] Error connecting to PostgreSQL: {e}")
            return False
    
    def disconnect(self):
        """Close the database connection."""
        if self.connection:
            self.connection.close()
            print("[INFO] Database connection closed")
    
    def execute_query(self, query: str, fetch_results: bool = True) -> Optional[List[Dict[str, Any]]]:
        """
        Execute a SQL query and return results.
        
        Args:
            query: SQL query to execute
            fetch_results: Whether to fetch and return results (True for SELECT, False for INSERT/UPDATE/DELETE)
            
        Returns:
            List of dictionaries containing query results, or None if error
        """
        if not self.connection:
            print("[ERROR] No database connection. Call connect() first.")
            return None
        
        try:
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query)
            
            if fetch_results:
                results = cursor.fetchall()
                # Convert results to list of dictionaries
                return [dict(row) for row in results]
            else:
                # For non-SELECT queries, commit the transaction
                self.connection.commit()
                affected_rows = cursor.rowcount
                print(f"[SUCCESS] Query executed successfully. {affected_rows} rows affected.")
                return None
                
        except Error as e:
            print(f"[ERROR] Error executing query: {e}")
            self.connection.rollback()
            return None
        finally:
            if 'cursor' in locals():
                cursor.close()
    
    def execute_file(self, file_path: str) -> bool:
        """
        Execute SQL queries from a file.
        
        Args:
            file_path: Path to SQL file
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with open(file_path, 'r') as file:
                sql_content = file.read()
            
            # Split by semicolon to separate multiple queries
            queries = [q.strip() for q in sql_content.split(';') if q.strip()]
            
            for i, query in enumerate(queries, 1):
                print(f"\n--- Executing Query {i}/{len(queries)} ---")
                print(f"Query: {query[:100]}{'...' if len(query) > 100 else ''}")
                
                # Determine if this is a SELECT query
                is_select = query.strip().upper().startswith('SELECT')
                results = self.execute_query(query, fetch_results=is_select)
                
                if results is not None and is_select:
                    print(f"Results ({len(results)} rows):")
                    print(json.dumps(results, indent=2, default=str))
            
            return True
            
        except FileNotFoundError:
            print(f"[ERROR] File not found: {file_path}")
            return False
        except Exception as e:
            print(f"[ERROR] Error reading file: {e}")
            return False

def main():
    """Main function to handle command line arguments and execute queries."""
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(
        description="PostgreSQL Database Query Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python db-query-tool.py -q "SELECT * FROM users LIMIT 5"
  python db-query-tool.py -q "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')"
  python db-query-tool.py -f queries.sql
  python db-query-tool.py --stdin < my_query.sql
  python db-query-tool.py -q "SELECT * FROM products" --output results.json
        """
    )
    
    parser.add_argument(
        '-q', '--query',
        help='SQL query to execute'
    )
    
    parser.add_argument(
        '-f', '--file',
        help='Path to SQL file containing queries to execute'
    )
    
    parser.add_argument(
        '--stdin',
        action='store_true',
        help='Read query from STDIN'
    )
    
    parser.add_argument(
        '--output',
        help='Output file to save results (JSON format)'
    )
    
    parser.add_argument(
        '--pretty',
        action='store_true',
        help='Pretty print results with better formatting'
    )
    
    args = parser.parse_args()
    
    # Check if at least one query source is provided
    if not args.query and not args.file and not args.stdin:
        parser.error("Either --query, --file, or --stdin must be specified")
    
    # Connection string (you can also make this configurable via environment variables)
    connection_string = "Host=shinkansen.proxy.rlwy.net;Port=59387;Database=multiplex_integration;Username=multiplex;Password=multiplex;CommandTimeout=60;Maximum Pool Size=100;Minimum Pool Size=10;Connection Idle Lifetime=300;Connection Pruning Interval=10;Pooling=true;Keepalive=30;"
    
    # Convert connection string format for psycopg2
    # Parse the connection string
    conn_params = {}
    for param in connection_string.split(';'):
        if '=' in param:
            key, value = param.split('=', 1)
            conn_params[key.strip()] = value.strip()
    
    # Convert to psycopg2 format
    psycopg2_conn_string = f"host={conn_params.get('Host', '')} " \
                          f"port={conn_params.get('Port', '5432')} " \
                          f"dbname={conn_params.get('Database', '')} " \
                          f"user={conn_params.get('Username', '')} " \
                          f"password={conn_params.get('Password', '')}"
    
    # Initialize and connect to database
    db_tool = PostgreSQLQueryTool(psycopg2_conn_string)
    
    if not db_tool.connect():
        sys.exit(1)
    
    try:
        results = None
        
        if args.query:
            # Execute single query
            print(f"Executing query: {args.query}")
            is_select = args.query.strip().upper().startswith('SELECT')
            results = db_tool.execute_query(args.query, fetch_results=is_select)

        elif args.stdin:
            # Execute query from stdin
            print("Executing query from STDIN...")
            query = sys.stdin.read()
            print(f"Query: {query[:100]}{'...' if len(query) > 100 else ''}")
            is_select = query.strip().upper().startswith('SELECT')
            results = db_tool.execute_query(query, fetch_results=is_select)

        elif args.file:
            # Execute queries from file
            print(f"Executing queries from file: {args.file}")
            success = db_tool.execute_file(args.file)
            if not success:
                sys.exit(1)
        
        if results is not None:
            if args.output:
                # Save results to file
                with open(args.output, 'w') as f:
                    json.dump(results, f, indent=2, default=str)
                print(f"[SUCCESS] Results saved to {args.output}")
            else:
                # Print results
                if args.pretty:
                    print(f"\nResults ({len(results)} rows):")
                    for i, row in enumerate(results, 1):
                        print(f"\n--- Row {i} ---")
                        for key, value in row.items():
                            print(f"  {key}: {value}")
                else:
                    print(f"\nResults ({len(results)} rows):")
                    print(json.dumps(results, indent=2, default=str))

    except KeyboardInterrupt:
        print("\n[WARNING] Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        sys.exit(1)
    finally:
        db_tool.disconnect()

if __name__ == "__main__":
    main()
