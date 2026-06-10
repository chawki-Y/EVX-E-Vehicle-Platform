#!/bin/bash

# Image Optimization Script for EVX-Web
# This script optimizes images in the assets directory

ASSETS_DIR="src/assets"
OUTPUT_DIR="src/assets/optimized"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "🖼️  Starting image optimization..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed. Please install it first:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    echo "   Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

# Function to optimize a single image
optimize_image() {
    local input_file="$1"
    local filename=$(basename "$input_file")
    local name="${filename%.*}"
    local extension="${filename##*.}"
    
    echo "📸 Processing: $filename"
    
    # Skip if already optimized
    if [[ "$filename" == *"optimized"* ]]; then
        echo "   ⏭️  Skipping already optimized file"
        return
    fi
    
    # Generate different sizes for responsive images
    # Thumbnail (100px width)
    convert "$input_file" -resize 100x -quality 60 -strip "$OUTPUT_DIR/${name}_thumb.webp"
    convert "$input_file" -resize 100x -quality 70 -strip "$OUTPUT_DIR/${name}_thumb.jpg"
    
    # Small (400px width)
    convert "$input_file" -resize 400x -quality 75 -strip "$OUTPUT_DIR/${name}_small.webp"
    convert "$input_file" -resize 400x -quality 80 -strip "$OUTPUT_DIR/${name}_small.jpg"
    
    # Medium (800px width)
    convert "$input_file" -resize 800x -quality 80 -strip "$OUTPUT_DIR/${name}_medium.webp"
    convert "$input_file" -resize 800x -quality 85 -strip "$OUTPUT_DIR/${name}_medium.jpg"
    
    # Large (1200px width)
    convert "$input_file" -resize 1200x -quality 85 -strip "$OUTPUT_DIR/${name}_large.webp"
    convert "$input_file" -resize 1200x -quality 90 -strip "$OUTPUT_DIR/${name}_large.jpg"
    
    # Original size optimized
    convert "$input_file" -quality 90 -strip "$OUTPUT_DIR/${name}_original.webp"
    convert "$input_file" -quality 95 -strip "$OUTPUT_DIR/${name}_original.jpg"
    
    echo "   ✅ Generated 10 optimized versions"
}

# Process all images in assets directory
for image_file in "$ASSETS_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
    # Check if file exists (handles case where no files match the pattern)
    if [[ -f "$image_file" ]]; then
        optimize_image "$image_file"
    fi
done

echo ""
echo "🎉 Image optimization complete!"
echo "📁 Optimized images saved to: $OUTPUT_DIR"
echo ""
echo "📊 File size comparison:"

# Show file size comparison
original_size=$(du -sh "$ASSETS_DIR" | cut -f1)
optimized_size=$(du -sh "$OUTPUT_DIR" | cut -f1)

echo "   Original assets: $original_size"
echo "   Optimized assets: $optimized_size"

echo ""
echo "💡 Usage tips:"
echo "   1. Use WebP format when possible (better compression)"
echo "   2. Use appropriate sizes based on display context"
echo "   3. Consider using the OptimizedImageComponent for automatic format selection"
echo ""
echo "🔧 Next steps:"
echo "   1. Update your components to use optimized images"
echo "   2. Implement responsive image loading"
echo "   3. Consider setting up a CDN for external images"