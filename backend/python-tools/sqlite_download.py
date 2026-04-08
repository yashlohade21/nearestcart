import requests
import time
import json
import os
import zipfile
import shutil
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
import logging
from urllib.parse import urlparse, urlunparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DBCreationClient:
    """Client for interacting with the MobileAppAction controller DB creation endpoints"""
    
    def __init__(self, base_url: str, timeout: int = 30):
        """
        Initialize the DB Creation Client
        
        Args:
            base_url: Base URL of the API (e.g., 'http://localhost:5000')
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        
    def initiate_db_creation(
        self,
        employee_uid: str,
        job_position_uid: str,
        role_uid: str,
        org_uid: str,
        vehicle_uid: str = None,
        emp_code: str = None
    ) -> Optional[Dict[str, Any]]:
        """
        Initiate the database creation process
        
        Returns:
            Response data with RequestId if successful, None otherwise
        """
        endpoint = f"{self.base_url}/api/MobileAppAction/InitiateDBCreation"
        
        params = {
            'employeeUID': employee_uid,
            'jobPositionUID': job_position_uid,
            'roleUID': role_uid,
            'orgUID': org_uid
        }
        
        if vehicle_uid:
            params['vehicleUID'] = vehicle_uid
        if emp_code:
            params['empCode'] = emp_code
            
        try:
            logger.info(f"Initiating DB creation for employee: {employee_uid}")
            response = self.session.post(endpoint, params=params, timeout=self.timeout)
            
            if response.status_code == 200:
                result = response.json()
                # Handle nested Data structure
                if 'Data' in result:
                    data = result['Data']
                    request_id = data.get('RequestId', 'N/A')
                else:
                    data = result
                    request_id = result.get('RequestId', 'N/A')
                    
                logger.info(f"DB creation initiated successfully. Request ID: {request_id}")
                return data
            else:
                logger.error(f"Failed to initiate DB creation. Status: {response.status_code}, Response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return None
            
    def get_db_creation_status(
        self,
        employee_uid: str,
        job_position_uid: str,
        role_uid: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get the current status of database creation

        Returns:
            Status data if successful, None otherwise
        """
        endpoint = f"{self.base_url}/api/MobileAppAction/GetDBCreationStatus"

        params = {
            'employeeUID': employee_uid,
            'jobPositionUID': job_position_uid,
            'roleUID': role_uid
        }

        try:
            response = self.session.get(endpoint, params=params, timeout=self.timeout)

            if response.status_code == 200:
                result = response.json()

                # Log the full response for debugging
                logger.debug(f"Full status response: {json.dumps(result, indent=2)}")

                # Handle nested Data structure
                if 'Data' in result:
                    return result['Data']
                else:
                    return result
            elif response.status_code == 404:
                logger.info("No database creation status found yet")
                return None
            else:
                logger.error(f"Failed to get DB creation status. Status: {response.status_code}, Response: {response.text}")
                return None

        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return None
            
    def download_from_url(
        self,
        download_url: str,
        output_path: str = None
    ) -> Optional[str]:
        """
        Download the database ZIP file from a direct URL
        
        Args:
            download_url: Direct URL to the ZIP file
            output_path: Path where to save the ZIP file (optional)
            
        Returns:
            Path to the downloaded file if successful, None otherwise
        """
        try:
            logger.info(f"Downloading database from URL: {download_url}")
            response = self.session.get(download_url, timeout=self.timeout, stream=True)
            
            if response.status_code == 200:
                # Extract filename from URL or use default
                filename = download_url.split('/')[-1]
                if not filename.endswith('.zip'):
                    filename = f"database_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
                
                # Determine output path
                if output_path:
                    file_path = output_path
                else:
                    file_path = os.path.join(os.getcwd(), filename)
                
                # Write file in chunks
                total_size = int(response.headers.get('content-length', 0))
                downloaded = 0
                
                with open(file_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                            downloaded += len(chunk)
                            if total_size > 0:
                                progress = (downloaded / total_size) * 100
                                # logger.info(f"Download progress: {progress:.1f}%")
                
                logger.info(f"Database downloaded successfully to: {file_path}")
                return file_path
            else:
                logger.error(f"Failed to download from URL. Status: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Download request failed: {e}")
            return None
            
    def download_db(
        self,
        employee_uid: str,
        job_position_uid: str,
        role_uid: str,
        org_uid: str,
        vehicle_uid: str = None,
        emp_code: str = None,
        output_path: str = None
    ) -> Optional[str]:
        """
        Download the database ZIP file using the DownloadDB endpoint
        
        Args:
            output_path: Path where to save the ZIP file (optional)
            
        Returns:
            Path to the downloaded file if successful, None otherwise
        """
        endpoint = f"{self.base_url}/api/MobileAppAction/DownloadDB"
        
        payload = {
            'employeeUID': employee_uid,
            'jobPositionUID': job_position_uid,
            'roleUID': role_uid,
            'orgUID': org_uid
        }
        
        if vehicle_uid:
            payload['vehicleUID'] = vehicle_uid
        if emp_code:
            payload['empCode'] = emp_code
            
        try:
            logger.info("Calling DownloadDB endpoint...")
            response = self.session.post(
                endpoint,
                json=payload,
                timeout=self.timeout,
                stream=True
            )
            
            if response.status_code == 200:
                # Determine filename from headers or use default
                content_disposition = response.headers.get('Content-Disposition', '')
                if 'filename=' in content_disposition:
                    filename = content_disposition.split('filename=')[-1].strip('"')
                else:
                    filename = f"database_{employee_uid}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
                
                # Determine output path
                if output_path:
                    file_path = output_path
                else:
                    file_path = os.path.join(os.getcwd(), filename)
                
                # Write file in chunks
                with open(file_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                
                logger.info(f"Database downloaded successfully to: {file_path}")
                return file_path
            else:
                logger.error(f"Failed to download database. Status: {response.status_code}, Response: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Download request failed: {e}")
            return None
            
    def wait_for_db_creation(
        self,
        employee_uid: str,
        job_position_uid: str,
        role_uid: str,
        org_uid: str,
        vehicle_uid: str = None,
        emp_code: str = None,
        poll_interval: int = 20,
        max_wait_time: int = 300,
        output_path: str = None
    ) -> Optional[str]:
        """
        Complete workflow: Initiate DB creation, poll for status, and download when ready
        
        Args:
            poll_interval: Seconds between status checks
            max_wait_time: Maximum seconds to wait for completion
            output_path: Path where to save the downloaded ZIP file
            
        Returns:
            Path to the downloaded file if successful, None otherwise
        """
        # Step 1: Initiate DB creation
        logger.info("=" * 60)
        logger.info("Starting database creation workflow")
        logger.info("=" * 60)
        
        init_result = self.initiate_db_creation(
            employee_uid, job_position_uid, role_uid, org_uid, vehicle_uid, emp_code
        )
        
        if not init_result:
            logger.error("Failed to initiate database creation")
            return None
            
        request_id = init_result.get('RequestId', 'Unknown')
        logger.info(f"Database creation initiated with Request ID: {request_id}")
        
        # Step 2: Poll for status
        logger.info(f"Polling for completion (checking every {poll_interval} seconds)...")
        start_time = time.time()
        sqlite_path = None
        
        while True:
            elapsed_time = time.time() - start_time
            
            if elapsed_time > max_wait_time:
                logger.error(f"Timeout: Database creation did not complete within {max_wait_time} seconds")
                return None
                
            time.sleep(poll_interval)
            
            status_result = self.get_db_creation_status(
                employee_uid, job_position_uid, role_uid
            )
            
            if status_result:
                status = status_result.get('Status', 'Unknown')
                sqlite_path = status_result.get('SqlitePath')

                # Fix the base URL if SqlitePath contains a wrong base URL
                if sqlite_path and sqlite_path.startswith('http'):
                    parsed_url = urlparse(sqlite_path)
                    base_parsed = urlparse(self.base_url)
                    # Replace scheme, netloc (host:port) from base_url but keep the path from SqlitePath
                    sqlite_path = urlunparse((
                        base_parsed.scheme,
                        base_parsed.netloc,
                        parsed_url.path,
                        parsed_url.params,
                        parsed_url.query,
                        parsed_url.fragment
                    ))
                    logger.info(f"Fixed SqlitePath URL to use correct base: {sqlite_path}")

                # Log full status including progress details
                logger.info(f"Current status: {status} (elapsed: {elapsed_time:.0f}s)")

                # Check for progress details in the response
                if 'Progress' in status_result:
                    progress = status_result['Progress']
                    logger.info(f"  Progress: {progress.get('ProgressPercentage', 0):.1f}%")
                    logger.info(f"  Phase: {progress.get('Phase', 'Unknown')}")
                    logger.info(f"  Current Table: {progress.get('CurrentTable', 'N/A')}")
                    logger.info(f"  Tables: {progress.get('TablesCompleted', 0)} completed, {progress.get('TablesFailed', 0)} failed of {progress.get('TotalTables', 0)} total")
                    logger.info(f"  Status: {progress.get('DetailedStatus', 'Processing...')}")

                    # Log estimated time remaining if available
                    if 'EstimatedTimeRemaining' in progress:
                        logger.info(f"  Estimated Time Remaining: {progress['EstimatedTimeRemaining']}")

                    # Log recent tables if available
                    if 'RecentTables' in progress and progress['RecentTables']:
                        logger.info("  Recent tables processed:")
                        for table in progress['RecentTables']:
                            logger.info(f"    - {table.get('Name', 'Unknown')}: {table.get('Status', 'Unknown')} ({table.get('Records', 0)} records, {table.get('Duration', 'N/A')})")

                    # Log any errors if present
                    if 'Errors' in progress and progress['Errors']:
                        logger.warning(f"  Errors encountered: {progress['Errors']}")

                # Check if SqlitePath is available (indicates completion)
                if status == 'Ready' and sqlite_path and sqlite_path.strip() and not sqlite_path.startswith('http://0.0.0.0'):
                    logger.info(f"Database is ready! Download URL: {sqlite_path}")
                    break

                # Also check status text
                if status.lower() in ['completed', 'ready', 'success', 'done']:
                    logger.info("Database creation completed!")
                    if sqlite_path:
                        break
                    else:
                        # Try DownloadDB endpoint if no SqlitePath
                        logger.info("No SqlitePath found, will try DownloadDB endpoint")
                        break
                elif status.lower() in ['failed', 'error']:
                    logger.error(f"Database creation failed with status: {status}")
                    error_msg = status_result.get('ErrorMessage', 'No error details available')
                    logger.error(f"Error details: {error_msg}")
                    return None
            else:
                logger.info(f"Waiting for status... (elapsed: {elapsed_time:.0f}s)")
                
        # Step 3: Download the database
        file_path = None
        
        # Try to download from SqlitePath URL if available
        if sqlite_path and sqlite_path.strip() and sqlite_path.startswith('http'):
            logger.info(f"Downloading from SqlitePath URL: {sqlite_path}")
            file_path = self.download_from_url(sqlite_path, output_path)
        
        # Fallback to DownloadDB endpoint if URL download failed or no URL
        if not file_path:
            logger.info("Attempting to download using DownloadDB endpoint...")
            file_path = self.download_db(
                employee_uid, job_position_uid, role_uid, org_uid,
                vehicle_uid, emp_code, output_path
            )
        
        if file_path:
            logger.info("=" * 60)
            logger.info(f"SUCCESS: Database downloaded to: {file_path}")
            logger.info("=" * 60)
            return file_path
        else:
            logger.error("Failed to download the database")
            return None
            
    def extract_and_cleanup(
        self,
        zip_path: str,
        extract_to: str = None,
        delete_zip: bool = True
    ) -> Tuple[bool, Optional[str]]:
        """
        Extract ZIP file and optionally delete it
        
        Args:
            zip_path: Path to the ZIP file
            extract_to: Directory to extract to (default: same directory as ZIP)
            delete_zip: Whether to delete the ZIP file after extraction
            
        Returns:
            Tuple of (success, extraction_directory)
        """
        if not os.path.exists(zip_path):
            logger.error(f"ZIP file not found: {zip_path}")
            return False, None
            
        # Determine extraction directory
        if extract_to:
            extract_dir = extract_to
        else:
            # Extract to a folder with the same name as the ZIP (without extension)
            base_name = os.path.splitext(os.path.basename(zip_path))[0]
            extract_dir = os.path.join(os.path.dirname(zip_path), base_name)
            
        try:
            # Create extraction directory if it doesn't exist
            os.makedirs(extract_dir, exist_ok=True)
            
            # Extract the ZIP file
            logger.info(f"Extracting ZIP file to: {extract_dir}")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                # List contents
                file_list = zip_ref.namelist()
                logger.info(f"ZIP contains {len(file_list)} file(s)")
                
                # Extract all files
                zip_ref.extractall(extract_dir)
                
                # Log extracted files
                for file_name in file_list[:5]:  # Show first 5 files
                    logger.info(f"  - {file_name}")
                if len(file_list) > 5:
                    logger.info(f"  ... and {len(file_list) - 5} more files")
                    
            logger.info(f"Successfully extracted to: {extract_dir}")
            
            # Delete ZIP file if requested
            if delete_zip:
                try:
                    os.remove(zip_path)
                    logger.info(f"Deleted ZIP file: {zip_path}")
                except Exception as e:
                    logger.warning(f"Could not delete ZIP file: {e}")
                    
            return True, extract_dir
            
        except zipfile.BadZipFile:
            logger.error(f"Invalid or corrupted ZIP file: {zip_path}")
            return False, None
        except Exception as e:
            logger.error(f"Failed to extract ZIP file: {e}")
            return False, None
            
    def complete_workflow_with_extraction(
        self,
        employee_uid: str,
        job_position_uid: str,
        role_uid: str,
        org_uid: str,
        vehicle_uid: str = None,
        emp_code: str = None,
        poll_interval: int = 5,
        max_wait_time: int = 300,
        output_path: str = None,
        extract: bool = True,
        delete_zip: bool = True
    ) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Complete workflow with automatic extraction
        
        Args:
            extract: Whether to extract the ZIP file
            delete_zip: Whether to delete ZIP after extraction
            
        Returns:
            Tuple of (success, zip_path, extraction_directory)
        """
        # Download the database
        zip_path = self.wait_for_db_creation(
            employee_uid, job_position_uid, role_uid, org_uid,
            vehicle_uid, emp_code, poll_interval, max_wait_time, output_path
        )
        
        if not zip_path:
            return False, None, None
            
        # Extract if requested
        if extract:
            success, extract_dir = self.extract_and_cleanup(zip_path, None, delete_zip)
            if success:
                logger.info("=" * 60)
                logger.info("COMPLETE SUCCESS!")
                logger.info(f"Database extracted to: {extract_dir}")
                if not delete_zip:
                    logger.info(f"ZIP file kept at: {zip_path}")
                logger.info("=" * 60)
                return True, zip_path if not delete_zip else None, extract_dir
            else:
                logger.error("Failed to extract ZIP file")
                return False, zip_path, None
        else:
            return True, zip_path, None

def main():
    """Main function to demonstrate usage"""
    # http://ed-modern-freeware-reel.trycloudflare.com/api/MobileAppAction/GetDBCreationStatus?employeeUID=TB3227&jobPositionUID=TB3227&roleUID=Promoter
    # Configuration - Update these values as needed
    BASE_URL = "https://multiplex.actuallyroy.com"  # Update with your actual API URL
    # Or use Cloudflare tunnel URL if available:
    # BASE_URL = "https://month-sciences-opposition-advised.trycloudflare.com"
    
    # Required parameters - Example values from actual response
    EMPLOYEE_UID = "TB9178"        # Example: TB3227
    JOB_POSITION_UID = "TB9178"    # Example: TB3227
    ROLE_UID = "Merchandiser"           # Example: Promoter
    ORG_UID = "EPIC01"             # Update with your organization UID
    
    # Optional parameters
    VEHICLE_UID = None  # Set if needed
    EMP_CODE = None     # Set if needed
    
    # Output configuration
    OUTPUT_PATH = None  # Set to specific path or leave None for current directory
    
    # Polling configuration
    POLL_INTERVAL = 5   # Check status every 5 seconds
    MAX_WAIT_TIME = 300 # Wait maximum 5 minutes
    
    # Extraction options
    EXTRACT_ZIP = True   # Set to True to automatically extract the ZIP
    DELETE_ZIP = True    # Set to True to delete ZIP after extraction
    
    # Create client
    client = DBCreationClient(BASE_URL)
    
    # Option 1: Run complete workflow with automatic extraction
    print("Starting database creation and extraction workflow...")
    success, zip_path, extract_dir = client.complete_workflow_with_extraction(
        employee_uid=EMPLOYEE_UID,
        job_position_uid=JOB_POSITION_UID,
        role_uid=ROLE_UID,
        org_uid=ORG_UID,
        vehicle_uid=VEHICLE_UID,
        emp_code=EMP_CODE,
        poll_interval=POLL_INTERVAL,
        max_wait_time=MAX_WAIT_TIME,
        output_path=OUTPUT_PATH,
        extract=EXTRACT_ZIP,
        delete_zip=DELETE_ZIP
    )
    
    if success:
        print("\nComplete Success!")
        if extract_dir:
            print(f"Database extracted to: {extract_dir}")
            # List extracted files
            if os.path.exists(extract_dir):
                files = os.listdir(extract_dir)
                print(f"Extracted {len(files)} file(s):")
                for f in files[:5]:
                    print(f"   - {f}")
                if len(files) > 5:
                    print(f"   ... and {len(files) - 5} more")
        if zip_path:
            print(f"ZIP file kept at: {zip_path}")
    else:
        print("\nFailed to complete database workflow")
    
    # Option 2: If you already have a ZIP file and just want to extract it
    # existing_zip = "path/to/your/database.zip"
    # success, extract_dir = client.extract_and_cleanup(existing_zip, None, delete_zip=True)
        

if __name__ == "__main__":
    main()