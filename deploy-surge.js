const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment to Surge.sh...');

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
  
  // Change to build directory
  process.chdir('build');
  
  // Create CNAME file for custom domain
  fs.writeFileSync('CNAME', 'lpu-marketplace.surge.sh');
  
  // Deploy to Surge
  console.log('🌐 Deploying to Surge.sh...');
  execSync('npx surge . lpu-marketplace.surge.sh', { stdio: 'inherit' });
  
  console.log('✅ Deployment successful!');
  console.log('🎉 Your app is live at: https://lpu-marketplace.surge.sh');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
