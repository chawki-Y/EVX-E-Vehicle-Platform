#!/bin/bash

# Advanced Image Optimization Script
# This script optimizes images to reduce bundle size significantly

echo "🖼️  Starting advanced image optimization..."

# Create optimized directory if it doesn't exist
mkdir -p src/assets/optimized

# Function to optimize JPEG images
optimize_jpeg() {
    local input="$1"
    local output="$2"
    local quality="$3"
    
    if command -v convert &> /dev/null; then
        # Using ImageMagick (if available)
        convert "$input" -quality "$quality" -strip -interlace Plane "$output"
        echo "✅ Optimized $input -> $output (Quality: $quality%)"
    elif command -v sips &> /dev/null; then
        # Using macOS sips (built-in)
        sips -s format jpeg -s formatOptions "$quality" "$input" --out "$output"
        echo "✅ Optimized $input -> $output (Quality: $quality%)"
    else
        echo "❌ No image optimization tool found. Please install ImageMagick or use macOS sips"
        cp "$input" "$output"
    fi
}

# Function to optimize PNG images
optimize_png() {
    local input="$1"
    local output="$2"
    
    if command -v convert &> /dev/null; then
        # Using ImageMagick
        convert "$input" -strip -define png:compression-level=9 "$output"
        echo "✅ Optimized $input -> $output"
    elif command -v sips &> /dev/null; then
        # Using macOS sips
        sips -s format png "$input" --out "$output"
        echo "✅ Optimized $input -> $output"
    else
        echo "❌ No image optimization tool found"
        cp "$input" "$output"
    fi
}

# Navigate to assets directory
cd src/assets

echo "📊 Original file sizes:"
ls -lah *.jpg *.png 2>/dev/null | grep -E '\.(jpg|png)$'

echo ""
echo "🔧 Optimizing images..."

# Optimize the largest images with aggressive compression
optimize_jpeg "default-car.jpg" "optimized/default-car-optimized.jpg" 60
optimize_jpeg "ElectricCar1.jpg" "optimized/ElectricCar1-optimized.jpg" 70
optimize_jpeg "ElectricCar2.jpg" "optimized/ElectricCar2-optimized.jpg" 70
optimize_png "EVX logo2.png" "optimized/EVX-logo2-optimized.png"

# Create WebP versions for modern browsers (if cwebp is available)
if command -v cwebp &> /dev/null; then
    echo "🚀 Creating WebP versions..."
    cwebp -q 70 "default-car.jpg" -o "optimized/default-car.webp"
    cwebp -q 75 "ElectricCar1.jpg" -o "optimized/ElectricCar1.webp"
    cwebp -q 75 "ElectricCar2.jpg" -o "optimized/ElectricCar2.webp"
    echo "✅ WebP versions created"
fi

echo ""
echo "📊 Optimized file sizes:"
ls -lah optimized/ 2>/dev/null

echo ""
echo "💾 Space saved:"
original_size=$(du -sh . | cut -f1)
optimized_size=$(du -sh optimized/ | cut -f1)
echo "Original assets: $original_size"
echo "Optimized assets: $optimized_size"

echo ""
echo "✅ Image optimization complete!"
echo "📝 Next steps:"
echo "   1. Update image references in components to use optimized versions"
echo "   2. Implement lazy loading for images"
echo "   3. Use WebP format with fallbacks for modern browsers"