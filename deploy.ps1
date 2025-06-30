# LPU Student Marketplace - Deployment Script
# Run this script to prepare your project for deployment

Write-Host "Preparing LPU Student Marketplace for Deployment..." -ForegroundColor Green

# Check if Git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit: LPU Student Marketplace"
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "📁 Git repository already exists" -ForegroundColor Blue
}

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "📝 Creating .gitignore file..." -ForegroundColor Yellow
    @"
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
client/build/
server/dist/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Uploads
server/uploads/*
!server/uploads/.gitkeep
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "✅ .gitignore file created" -ForegroundColor Green
}

# Check if package.json exists in root
if (-not (Test-Path "package.json")) {
    Write-Host "📦 Creating root package.json..." -ForegroundColor Yellow
    @"
{
  "name": "lpu-student-marketplace",
  "version": "1.0.0",
  "description": "A student-to-student marketplace for LPU students",
  "main": "server/server.js",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm run dev",
    "client": "cd client && npm start",
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "install-all": "npm install && cd client && npm install && cd ../server && npm install",
    "heroku-postbuild": "cd client && npm install && npm run build"
  },
  "keywords": ["marketplace", "student", "lpu", "react", "nodejs"],
  "author": "LPU Students",
  "license": "MIT",
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding UTF8
    Write-Host "✅ Root package.json created" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Project is ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create accounts on:" -ForegroundColor White
Write-Host "   - GitHub (code repository)" -ForegroundColor Gray
Write-Host "   - MongoDB Atlas (database)" -ForegroundColor Gray
Write-Host "   - Cloudinary (image hosting)" -ForegroundColor Gray
Write-Host "   - Vercel (frontend hosting)" -ForegroundColor Gray
Write-Host "   - Railway (backend hosting)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Follow the detailed guide in DEPLOYMENT.md" -ForegroundColor White
Write-Host ""
Write-Host "3. Push to GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/lpu-student-marketplace.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Read DEPLOYMENT.md for complete step-by-step instructions!" -ForegroundColor Yellow
