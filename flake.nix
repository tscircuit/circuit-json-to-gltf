{
  description = "A Nix-flake-based development environment for circuit-json-to-gltf";

  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1";

  outputs = inputs: let
    supportedSystems = [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ];
    forEachSupportedSystem = f:
      inputs.nixpkgs.lib.genAttrs supportedSystems (
        system:
          f {
            pkgs = import inputs.nixpkgs {inherit system;};
          }
      );
  in {
    devShells = forEachSupportedSystem (
      {pkgs}: {
        default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Core development tools
            bun
            nodejs_22
            typescript

            # Build tools required for native node modules
            pkg-config
            python3
            gnumake
            gcc14
            file
            patchelf
            autoPatchelfHook

            # libvips for sharp (complete installation)
            vips
            vips.dev

            # Required runtime libraries for Sharp
            gcc.cc.lib
            glibc
          ];

          # Environment variables for native compilation
          shellHook = ''
            # Library paths for runtime - use gcc.cc.lib for correct 64-bit libraries
            export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [
              pkgs.gcc.cc.lib
              pkgs.glibc
              pkgs.vips
            ]}"

            # Pkg-config path for build-time
            export PKG_CONFIG_PATH="${pkgs.vips.dev}/lib/pkgconfig:$PKG_CONFIG_PATH"

            # Sharp/libvips configuration
            export SHARP_FORCE_GLOBAL_LIBVIPS=true
            export npm_config_sharp_libvips_local_prebuilds=false

            # Add tools to PATH
            export PATH="${pkgs.bun}/bin:$PATH"

            # Memory allocator for better Sharp performance
            export MALLOC_CONF="background_thread:true,metadata_thp:auto"

            echo "🚀 Nix development environment loaded"
            echo ""
            echo "📦 Installed packages:"
            echo "  • Bun: $(bun --version)"
            echo "  • Node.js: $(node --version)"
            echo "  • libvips: $(pkg-config --modversion vips-cpp)"
            echo ""
            echo "🔧 Setup commands:"
            echo "  1. rm -rf node_modules && bun install"
            echo "  2. ./rebuild-sharp.sh (rebuild Sharp with system libvips)"
            echo "  3. bun test (run tests)"
            echo ""
            echo "💡 Environment ready! Sharp configured with system libvips."
            echo "📝 All library paths and environment variables are set automatically."

            # Create a script to properly rebuild Sharp for Nix
            cat > rebuild-sharp.sh << 'EOF'
#!/usr/bin/env bash
echo "🔧 Rebuilding Sharp for Nix environment..."

# Remove prebuilt Sharp binaries
find node_modules -path "*/sharp/vendor" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -path "*/sharp/build" -type d -exec rm -rf {} + 2>/dev/null || true

# Set environment for rebuilding with system libvips
export npm_config_sharp_libvips_local_prebuilds=false
export npm_config_sharp_libvips_lib=${pkgs.vips}/lib
export npm_config_sharp_libvips_include=${pkgs.vips.dev}/include

# Rebuild all Sharp instances
echo "Rebuilding main Sharp..."
cd node_modules/sharp 2>/dev/null && npm run install --silent && cd ../.. || echo "No main Sharp found"

echo "Rebuilding looks-same Sharp..."
cd node_modules/looks-same/node_modules/sharp 2>/dev/null && npm run install --silent && cd ../../../.. || echo "No looks-same Sharp found"

echo "✅ Sharp rebuilt with system libvips!"
EOF
            chmod +x rebuild-sharp.sh
          '';
        };
      }
    );
  };
}