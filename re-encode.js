const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'web', 'app', 'dashboard', 'templates', 'page.tsx');

// Read the file as a Buffer (the raw bytes)
const fileBuffer = fs.readFileSync(filePath);

// Remove BOM if present (UTF-16 LE BOM is 0xFF 0xFE)
const buffer = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xFE 
  ? fileBuffer.slice(2) 
  : fileBuffer;

// Decode from UTF-16LE to string
const content = buffer.toString('utf16le');

// Write as valid UTF-8 
fs.writeFileSync(filePath, content, 'utf-8');

console.log('Re-encoded to UTF-8 successfully.');
