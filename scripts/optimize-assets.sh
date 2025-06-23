#!/bin/bash

# Optimize images in public directory
echo "Optimizing images..."

# Install imagemin if not present
if ! command -v imagemin &> /dev/null; then
    npm install -g imagemin-cli imagemin-webp imagemin-avif
fi

# Convert images to WebP and AVIF
find public/images -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read img; do
    echo "Converting $img"
    imagemin "$img" --plugin=webp --out-dir="public/images/webp/"
    imagemin "$img" --plugin=avif --out-dir="public/images/avif/"
done

echo "Image optimization complete"
