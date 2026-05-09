const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'web', 'app', 'dashboard', 'templates', 'page.tsx');
const fileBuffer = fs.readFileSync(filePath);

// Find potential BOM or invalid UTF-8 start bytes near the beginning
console.log('First 20 bytes:', fileBuffer.slice(0, 20));
console.log('Last 20 bytes:', fileBuffer.slice(-20));

// Re-write using UTF-8 encoding cleanly
fs.writeFileSync(filePath, fileBuffer.toString('utf-8'), 'utf-8');
console.log('File re-encoded successfully.');
