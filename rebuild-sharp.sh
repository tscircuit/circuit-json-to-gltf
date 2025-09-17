#!/usr/bin/env bash
echo "🔧 Rebuilding Sharp for Nix environment..."

# Remove prebuilt Sharp binaries
find node_modules -path "*/sharp/vendor" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -path "*/sharp/build" -type d -exec rm -rf {} + 2>/dev/null || true

# Set environment for rebuilding with system libvips
export npm_config_sharp_libvips_local_prebuilds=false
export npm_config_sharp_libvips_lib=/nix/store/8aajkvniichm2j7mc93zqrgjvcn5w6bw-vips-8.17.1-bin/lib
export npm_config_sharp_libvips_include=/nix/store/3ql77sr24a496li1r4pg9xg9crnjiylf-vips-8.17.1-dev/include

# Rebuild all Sharp instances
echo "Rebuilding main Sharp..."
cd node_modules/sharp 2>/dev/null && npm run install --silent && cd ../.. || echo "No main Sharp found"

echo "Rebuilding looks-same Sharp..."
cd node_modules/looks-same/node_modules/sharp 2>/dev/null && npm run install --silent && cd ../../../.. || echo "No looks-same Sharp found"

echo "✅ Sharp rebuilt with system libvips!"
