# circuit-json-to-gltf

Converts circuit json to a 3D gltf file. Used for exporting circuits.

Implementation details:

- Uses `circuit-to-svg` to render the top/bottom layers of the board to SVG, then `resvg` to convert the SVG to a PNG
- Includes a builtin `stl` and `obj` model converter to support model URL loading
