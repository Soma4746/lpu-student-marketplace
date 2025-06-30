# 🚀 LPU Student Marketplace - Deployment Guide

## 📋 Prerequisites

1. **GitHub Account** - To store your code
2. **MongoDB Atlas Account** - Free database hosting
3. **Cloudinary Account** - Free image hosting
4. **Vercel Account** - Free frontend hosting
5. **Railway Account** - Free backend hosting

---

## 🗂️ STEP 1: Setup Database (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a new cluster (choose free tier)
4. Wait for cluster to be created (2-3 minutes)

### 1.2 Setup Database Access
1. Go to "Database Access" → "Add New Database User"
2. Create username and password (save these!)
3. Set privileges to "Read and write to any database"

### 1.3 Setup Network Access
1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. Confirm

### 1.4 Get Connection String
1. Go to "Clusters" → Click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password

---

## 🖼️ STEP 2: Setup Image Hosting (Cloudinary)

### 2.1 Create Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Go to Dashboard

### 2.2 Get API Credentials
1. Copy these values from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

---

## 📤 STEP 3: Push Code to GitHub

### 3.1 Initialize Git Repository
```bash
cd lpu
git init
git add .
git commit -m "Initial commit: LPU Student Marketplace"
```

### 3.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click "New Repository"
3. Name it "lpu-student-marketplace"
4. Don't initialize with README (we already have code)
5. Click "Create Repository"

### 3.3 Push Code
```bash
git remote add origin https://github.com/YOUR_USERNAME/lpu-student-marketplace.git
git branch -M main
git push -u origin main
```

---

## 🖥️ STEP 4: Deploy Backend (Railway)

### 4.1 Create Railway Account
1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub account
3. Authorize Railway to access your repositories

### 4.2 Deploy Backend
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your "lpu-student-marketplace" repository
4. Railway will automatically detect and deploy

### 4.3 Configure Environment Variables
1. Go to your project → "Variables" tab
2. Add these environment variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-super-secret-jwt-key-generate-a-strong-one
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
FRONTEND_URL=https://your-app-name.vercel.app
```

### 4.4 Get Backend URL
1. Go to "Settings" → "Domains"
2. Copy the generated URL (e.g., `https://your-app-name.railway.app`)

---

## 🌐 STEP 5: Deploy Frontend (Vercel)

### 5.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### 5.2 Deploy Frontend
1. Click "New Project"
2. Import your "lpu-student-marketplace" repository
3. Configure project:
   - Framework Preset: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`

### 5.3 Configure Environment Variables
1. Go to Project Settings → "Environment Variables"
2. Add:
```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_APP_NAME=LPU Student Marketplace
```

### 5.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Get your frontend URL (e.g., `https://your-app-name.vercel.app`)

---

## 🔄 STEP 6: Update Backend CORS

### 6.1 Update Frontend URL in Railway
1. Go back to Railway project
2. Update the `FRONTEND_URL` environment variable
3. Set it to your Vercel URL: `https://your-app-name.vercel.app`
4. Redeploy the backend

---

## ✅ STEP 7: Test Your Deployment

### 7.1 Test Frontend
1. Visit your Vercel URL
2. Check if the homepage loads correctly
3. Test navigation between pages

### 7.2 Test Backend
1. Visit `https://your-backend-url.railway.app/api/health`
2. Should return: `{"status": "OK", "message": "Server is running"}`

### 7.3 Test Full Integration
1. Try registering a new user
2. Try logging in
3. Test creating an item or talent listing

---

## 🎉 Congratulations!

Your LPU Student Marketplace is now live!

**Frontend URL**: https://your-app-name.vercel.app
**Backend URL**: https://your-backend-url.railway.app

---

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. **Database Connection**: Verify MongoDB connection string and network access
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Errors**: Check build logs in Vercel/Railway for specific error messages

### Getting Help:
- Check deployment logs in Vercel/Railway dashboards
- Verify all environment variables are set
- Test API endpoints individually
- Check browser console for frontend errors

---

## 📈 Next Steps

1. **Custom Domain**: Add your own domain in Vercel settings
2. **SSL Certificate**: Automatically provided by Vercel
3. **Monitoring**: Set up error tracking with Sentry
4. **Analytics**: Add Google Analytics
5. **Performance**: Optimize images and add caching
