#!/bin/bash
# Script to generate PWA icons from the main logo
# Usage: ./scripts/generate-icons.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PUBLIC_DIR="$PROJECT_ROOT/public"
LOGO_FILE="$PUBLIC_DIR/logo.png"

echo "🎨 Generating PWA icons..."

# Check if logo exists
if [ ! -f "$LOGO_FILE" ]; then
    echo "❌ Error: logo.png not found at $LOGO_FILE"
    exit 1
fi

# Check if sips is available (macOS)
if ! command -v sips &> /dev/null; then
    echo "❌ Error: sips command not found. This script requires macOS."
    echo "   For other systems, use ImageMagick: convert logo.png -resize 192x192 logo-192.png"
    exit 1
fi

cd "$PUBLIC_DIR"

# Generate PWA icons
echo "📱 Generating 192x192 icon..."
sips -z 192 192 "$LOGO_FILE" --out logo-192.png > /dev/null

echo "📱 Generating 512x512 icon..."
sips -z 512 512 "$LOGO_FILE" --out logo-512.png > /dev/null

echo "🍎 Generating Apple Touch Icon (180x180)..."
sips -z 180 180 "$LOGO_FILE" --out apple-touch-icon.png > /dev/null

# Verify files were created
if [ -f "logo-192.png" ] && [ -f "logo-512.png" ] && [ -f "apple-touch-icon.png" ]; then
    echo "✅ Icons generated successfully!"
    echo ""
    echo "Generated files:"
    ls -lh logo-192.png logo-512.png apple-touch-icon.png | awk '{print "  " $9 " (" $5 ")"}'
else
    echo "❌ Error: Some icons were not generated"
    exit 1
fi

