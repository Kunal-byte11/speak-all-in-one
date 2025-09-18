#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting deployment process...\n');

// Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'package.json',
  'netlify/functions/api.ts'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file}`);
}

// Check environment variables
console.log('\n🔧 Checking environment variables...');
const requiredEnvVars = ['GOOGLE_GENAI_API_KEY'];
const missingEnvVars = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingEnvVars.push(envVar);
  } else {
    console.log(`✅ ${envVar} is set`);
  }
}

if (missingEnvVars.length > 0) {
  console.log('\n⚠️  Missing environment variables:');
  missingEnvVars.forEach(envVar => {
    console.log(`   - ${envVar}`);
  });
  console.log('\n💡 Make sure to set these in your Netlify dashboard:');
  console.log('   Site settings → Environment variables');
}

// Build the project
console.log('\n🔨 Building project...');
try {
  execSync('npm run build:client', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check if Netlify CLI is available
console.log('\n🌐 Checking Netlify CLI...');
try {
  execSync('netlify --version', { stdio: 'pipe' });
  console.log('✅ Netlify CLI is available');
  
  console.log('\n🚀 Ready to deploy!');
  console.log('\nTo deploy, run one of these commands:');
  console.log('   netlify deploy --prod --dir=dist/spa  (manual deploy)');
  console.log('   netlify open                          (open dashboard)');
  
} catch (error) {
  console.log('⚠️  Netlify CLI not found');
  console.log('\n📝 Manual deployment options:');
  console.log('1. Drag and drop dist/spa folder to Netlify dashboard');
  console.log('2. Connect your Git repository to Netlify');
  console.log('3. Install Netlify CLI: npm install -g netlify-cli');
}

console.log('\n📚 For detailed instructions, see: deploy-guide.md');
console.log('\n🎉 Your AI counselor chatbot is ready for deployment!');