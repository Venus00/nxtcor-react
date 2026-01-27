#!/usr/bin/env python3
"""
Download OpenStreetMap tiles for offline use
Coordinates: bbox=2.50517,42.48919,2.51517,42.49919
"""

import os
import urllib.request
import time
import math

# Configuration
TILE_SERVER = "https://tile.openstreetmap.org"
OUTPUT_DIR = "public/map-tiles"
MIN_ZOOM = 12
MAX_ZOOM = 18

# Bounding box from your OpenStreetMap URL
MIN_LAT = 42.48919
MAX_LAT = 42.49919
MIN_LON = 2.50517
MAX_LON = 2.51517

def deg2num(lat_deg, lon_deg, zoom):
    """Convert lat/lon to tile numbers"""
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

def download_tile(zoom, x, y, output_dir):
    """Download a single tile"""
    url = f"{TILE_SERVER}/{zoom}/{x}/{y}.png"
    tile_dir = os.path.join(output_dir, str(zoom), str(x))
    os.makedirs(tile_dir, exist_ok=True)
    
    tile_path = os.path.join(tile_dir, f"{y}.png")
    
    if os.path.exists(tile_path):
        print(f"Tile already exists: {zoom}/{x}/{y}")
        return True
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Offline Map Downloader)'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            with open(tile_path, 'wb') as f:
                f.write(response.read())
        print(f"Downloaded: {zoom}/{x}/{y}")
        time.sleep(0.1)  # Be nice to the tile server
        return True
    except Exception as e:
        print(f"Error downloading {zoom}/{x}/{y}: {e}")
        return False

def main():
    """Download all tiles for the specified area and zoom levels"""
    print(f"Downloading tiles from zoom {MIN_ZOOM} to {MAX_ZOOM}")
    print(f"Bounding box: {MIN_LAT},{MIN_LON} to {MAX_LAT},{MAX_LON}")
    
    total_tiles = 0
    successful = 0
    
    for zoom in range(MIN_ZOOM, MAX_ZOOM + 1):
        # Get tile coordinates for bounding box
        min_tile_x, max_tile_y = deg2num(MIN_LAT, MIN_LON, zoom)
        max_tile_x, min_tile_y = deg2num(MAX_LAT, MAX_LON, zoom)
        
        print(f"\nZoom level {zoom}: tiles {min_tile_x}-{max_tile_x}, {min_tile_y}-{max_tile_y}")
        
        for x in range(min_tile_x, max_tile_x + 1):
            for y in range(min_tile_y, max_tile_y + 1):
                total_tiles += 1
                if download_tile(zoom, x, y, OUTPUT_DIR):
                    successful += 1
    
    print(f"\n{'='*50}")
    print(f"Download complete!")
    print(f"Total tiles: {total_tiles}")
    print(f"Successful: {successful}")
    print(f"Failed: {total_tiles - successful}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
