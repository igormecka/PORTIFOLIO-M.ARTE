import os
import json
import logging
from google.oauth2 import service_account
from googleapiclient.discovery import build
import datetime
import urllib.request
import email.utils
import google.auth._helpers

def get_google_time():
    try:
        req = urllib.request.urlopen('https://www.google.com', timeout=5)
        d = req.headers['Date']
        # Convert RFC 2822 date to naive datetime in UTC
        dt = email.utils.parsedate_to_datetime(d)
        return dt.replace(tzinfo=None)
    except Exception as e:
        return _original_utcnow() - datetime.timedelta(minutes=5)

# Bypass time drift using internet HTTP header time
_original_utcnow = google.auth._helpers.utcnow
google.auth._helpers.utcnow = get_google_time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Scopes needed for Drive API (read-only)
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# Output file path
OUTPUT_JS_PATH = 'assets/js/drive_data.js'

def get_drive_service():
    """Authenticates and returns the Google Drive service."""
    creds_json = os.environ.get('DRIVE_CREDENTIALS')
    
    if creds_json:
        logging.info("Using DRIVE_CREDENTIALS from environment variables.")
        try:
            creds_dict = json.loads(creds_json)
            creds = service_account.Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
        except Exception as e:
            logging.error(f"Failed to parse DRIVE_CREDENTIALS JSON: {e}")
            raise
    else:
        logging.info("Using local 'drive_credentials.json' file.")
        if not os.path.exists('drive_credentials.json'):
            raise Exception("drive_credentials.json not found and no DRIVE_CREDENTIALS environment variable set.")
        creds = service_account.Credentials.from_service_account_file('drive_credentials.json', scopes=SCOPES)
        
    service = build('drive', 'v3', credentials=creds)
    return service

def find_folder(service, name, parent_id=None):
    """Finds a folder by name, optionally inside a parent folder."""
    query = f"mimeType='application/vnd.google-apps.folder' and name='{name}' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"
        
    results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
    items = results.get('files', [])
    if not items:
        return None
    return items[0]['id']

def get_subfolders(service, parent_id):
    """Gets all subfolders inside a parent folder."""
    query = f"mimeType='application/vnd.google-apps.folder' and '{parent_id}' in parents and trashed=false"
    results = service.files().list(q=query, spaces='drive', fields='files(id, name)', orderBy='name').execute()
    return results.get('files', [])

def get_images_in_folder(service, folder_id):
    """Gets images inside a folder. Returns a list of direct image URLs."""
    query = f"mimeType contains 'image/' and '{folder_id}' in parents and trashed=false"
    # Requesting thumbnailLink allows us to get the original image by replacing the size parameter
    results = service.files().list(q=query, spaces='drive', fields='files(id, name, thumbnailLink, webContentLink)', orderBy='name').execute()
    items = results.get('files', [])
    
    images = []
    for item in items:
        if 'thumbnailLink' in item:
            # Replace `=s220` with `=w1920` to get optimized 1920px image (reduces load time by 90%)
            url = item['thumbnailLink'].split('=')[0] + '=w1920'
            images.append(url)
        elif 'webContentLink' in item:
            images.append(item['webContentLink'])
            
    return images

def main():
    try:
        service = get_drive_service()
        
        # 1. Find root folder
        root_name = "m.arte portifolio"
        root_id = find_folder(service, root_name)
        
        if not root_id:
            logging.error(f"Root folder '{root_name}' not found. Did you share it with the service account?")
            raise Exception("Root folder not found.")
            
        logging.info(f"Root folder found (ID: {root_id})")
        
        data = {
            "heroImages": [],
            "albums": []
        }
        
        # 2. Get images for 'pagina principal'
        home_id = find_folder(service, "pagina principal", root_id)
        if home_id:
            logging.info(f"Found 'pagina principal' folder (ID: {home_id})")
            home_images = get_images_in_folder(service, home_id)
            data["heroImages"] = home_images
            logging.info(f"  -> Found {len(home_images)} images for home.")
        else:
            logging.warning("Folder 'pagina principal' not found inside root.")
            
        # 3. Get albums from 'portifolio'
        portfolio_id = find_folder(service, "portifolio", root_id)
        if portfolio_id:
            logging.info(f"Found 'portifolio' folder (ID: {portfolio_id})")
            albums = get_subfolders(service, portfolio_id)
            
            for album in albums:
                album_name = album['name']
                logging.info(f"  Processing album: {album_name}")
                images = get_images_in_folder(service, album['id'])
                
                # We need a cover, use the first image 
                cover = images[0] if len(images) > 0 else "https://via.placeholder.com/800x600?text=No+Image"
                
                data["albums"].append({
                    "name": album_name,
                    "cover": cover,
                    "images": images
                })
        else:
            logging.warning("Folder 'portifolio' not found inside root.")
            
        # Output as JS module/variable
        os.makedirs(os.path.dirname(OUTPUT_JS_PATH), exist_ok=True)
        with open(OUTPUT_JS_PATH, 'w', encoding='utf-8') as f:
            f.write("const driveData = ")
            f.write(json.dumps(data, indent=2, ensure_ascii=False))
            f.write(";\n")
            
        logging.info(f"Successfully wrote data to {OUTPUT_JS_PATH}")
        
    except Exception as e:
        logging.error(f"Error executing sync: {e}")
        exit(1)

if __name__ == '__main__':
    main()
