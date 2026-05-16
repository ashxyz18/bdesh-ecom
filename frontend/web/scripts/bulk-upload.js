const fs = require('fs');
const path = require('path');

// Configuration
const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'http://localhost:3000';
const TEMPLATES_DIR = path.join(__dirname, '../templates-to-upload');

async function bulkUpload() {
  console.log(`\n🚀 Starting Bulk Upload to ${PLATFORM_URL}/api/templates\n`);

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.log(`❌ Directory not found: ${TEMPLATES_DIR}`);
    console.log(`👉 Please create a 'templates-to-upload' folder in your frontend/web directory and put your ZIP files there.`);
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
    return;
  }

  const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.zip'));

  if (files.length === 0) {
    console.log(`⚠️ No ZIP files found in ${TEMPLATES_DIR}`);
    return;
  }

  for (const file of files) {
    const filePath = path.join(TEMPLATES_DIR, file);
    const templateName = file.replace('.zip', '');
    
    console.log(`⏳ Uploading: ${file}...`);
    
    try {
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: 'application/zip' });
      
      formData.append('file', blob, file);
      formData.append('name', templateName);
      formData.append('description', `Bulk uploaded template: ${templateName}`);
      formData.append('thumbnail', ''); // Optional: add logic to read a matching .png file if you want auto-thumbnails!

      const response = await fetch(`${PLATFORM_URL}/api/templates`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ Success! Template '${templateName}' uploaded. ID: ${result.template.id}`);
        console.log(`   Build status: ${result.template.buildStatus}`);
      } else {
        console.log(`❌ Failed: ${result.error || response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error uploading ${file}: ${error.message}`);
    }
    console.log('-----------------------------------');
  }

  console.log(`\n🎉 Bulk upload process finished!`);
  console.log(`Check the dashboard to track the build status of your templates.`);
}

bulkUpload();
