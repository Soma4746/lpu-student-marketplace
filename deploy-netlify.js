const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment to Netlify...');

try {
  // Change to client directory
  process.chdir('client');
  
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Build the app
  console.log('🔨 Building React app...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      REACT_APP_API_URL: 'https://lpu-student-marketplace.onrender.com/api',
      REACT_APP_RAZORPAY_KEY_ID: 'rzp_test_1234567890',
      CI: 'false',
      GENERATE_SOURCEMAP: 'false'
    }
  });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Build files are in: client/build/');
  console.log('');
  console.log('🌐 Next steps:');
  console.log('1. Go to https://app.netlify.com/drop');
  console.log('2. Drag and drop the client/build folder');
  console.log('3. Your site will be deployed instantly!');
  console.log('');
  console.log('Or use Netlify CLI:');
  console.log('npx netlify deploy --prod --dir=client/build');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
