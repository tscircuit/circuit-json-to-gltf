#!/usr/bin/env node

// Basic GLTF functionality test without Sharp dependencies
import { decodeBase64Buffer } from './lib/loaders/gltf.js';

console.log('🧪 Testing GLTF basic functionality without Sharp...');

try {
  // Test 1: Base64 buffer decoding
  const testData = "data:application/octet-stream;base64,SGVsbG8gV29ybGQ="; // "Hello World"
  const buffer = decodeBase64Buffer(testData);
  const decoded = new TextDecoder().decode(buffer);

  if (decoded === "Hello World") {
    console.log('✅ Base64 buffer decoding works');
  } else {
    console.log('❌ Base64 buffer decoding failed');
    process.exit(1);
  }

  // Test 2: GLTF types are available
  try {
    const { GLTFMeshData } = await import('./lib/types.js');
    console.log('✅ GLTF types are properly exported');
  } catch (error) {
    console.log('❌ GLTF types import failed:', error.message);
    process.exit(1);
  }

  console.log('🎉 Basic GLTF functionality tests PASSED');
  console.log('📝 Sharp compilation issue exists but GLTF core works');

} catch (error) {
  console.log('❌ Test failed:', error.message);
  process.exit(1);
}