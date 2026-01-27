# Offline Map Setup

## Overview
This setup allows the application to work with offline maps using Leaflet and pre-downloaded OpenStreetMap tiles.

## Download Map Tiles

Run the Python script to download map tiles for your area:

```bash
python download_map_tiles.py
```

This will download tiles for:
- **Location**: 42.49419°N, 2.51017°E (Andorra area)
- **Zoom levels**: 12-18
- **Output**: `public/map-tiles/{z}/{x}/{y}.png`

The script downloads approximately 1,000-5,000 tiles depending on the zoom range.

## Configuration

### Change Map Area
Edit `download_map_tiles.py` and modify these values:

```python
MIN_LAT = 42.48919  # Southern latitude
MAX_LAT = 42.49919  # Northern latitude
MIN_LON = 2.50517   # Western longitude
MAX_LON = 2.51517   # Eastern longitude
MIN_ZOOM = 12       # Minimum zoom level
MAX_ZOOM = 18       # Maximum zoom level
```

### Change Map Center
Edit `src/components/OfflineMap.tsx`:

```typescript
const position: [number, number] = [42.49419, 2.51017];
const zoom = 15;
```

## Fallback to Online Mode

If offline tiles are not available, edit `src/components/OfflineMap.tsx` and uncomment the fallback URL:

```typescript
<TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  // url="/map-tiles/{z}/{x}/{y}.png"  // Comment out for online mode
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"  // Uncomment for online mode
/>
```

## Notes

- The tile server has usage limits. The script includes a 0.1s delay between requests.
- Tiles are cached - rerunning the script won't re-download existing tiles.
- For larger areas or higher zoom levels, download time increases significantly.
- Respect OpenStreetMap's [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/).

## Estimated Storage

- Zoom 12-14: ~100-500 tiles (~5-25 MB)
- Zoom 15-16: ~500-2000 tiles (~25-100 MB)
- Zoom 17-18: ~2000-8000 tiles (~100-400 MB)

## Alternative: Static Map Image

If you only need a static map image, you can use this URL to download a single PNG:

```
https://render.openstreetmap.org/cgi-bin/export?bbox=2.50517,42.48919,2.51517,42.49919&scale=5000&format=png
```

Then replace the `<OfflineMap />` component with a simple `<img>` tag.
