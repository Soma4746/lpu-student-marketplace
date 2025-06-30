# LPU Marketplace Setup Guide

## 🚀 Quick Setup Instructions

### 1. MongoDB Atlas Setup (Free Cloud Database)

1. **Create MongoDB Atlas Account**
   - Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" and create an account
   - Choose "Build a Database" → "M0 Sandbox" (Free tier)

2. **Create Cluster**
   - Choose "AWS" as cloud provider
   - Select a region close to you (e.g., Mumbai for India)
   - Cluster Name: `lpu-marketplace`
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Username: `lpuadmin`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Setup Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Driver: Node.js, Version: 4.1 or later
   - Copy the connection string (looks like):
   ```
   mongodb+srv://lpuadmin:<password>@lpu-marketplace.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Update Environment Variables

Replace `<password>` in the connection string with your actual password and update the `.env` file:

```env
MONGODB_URI=mongodb+srv://lpuadmin:YOUR_PASSWORD@lpu-marketplace.xxxxx.mongodb.net/lpu-marketplace?retryWrites=true&w=majority
```

### 3. Install Dependencies and Start

```bash
# Install all dependencies
npm run install-all

# Seed the database with sample data
npm run seed

# Start both frontend and backend
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

### 5. Test Login Credentials

**Admin Account:**
- Email: `admin@lpu.co.in`
- Password: `admin123`

**Student Accounts:**
- Email: `john.doe@lpu.co.in` | Password: `password123`
- Email: `jane.smith@lpu.co.in` | Password: `password123`
- Email: `alex.johnson@lpu.co.in` | Password: `password123`

## 🛠️ Alternative: Local MongoDB Setup

If you prefer to run MongoDB locally:

### Windows:
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. Start MongoDB service
4. Use connection string: `mongodb://localhost:27017/lpu-marketplace`

### macOS:
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Linux (Ubuntu):
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🔧 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Check if MongoDB service is running
   - Verify connection string in `.env` file
   - Ensure network access is configured (for Atlas)

2. **Port Already in Use**
   - Frontend (3000): `npx kill-port 3000`
   - Backend (5000): `npx kill-port 5000`

3. **Dependencies Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm run install-all` again

4. **Seeding Fails**
   - Ensure MongoDB is connected
   - Check database permissions
   - Verify `.env` configuration

### Environment Variables Checklist:

**Server (.env):**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

**Client (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

## 📱 Features to Test

1. **Authentication**
   - Register new account
   - Login/logout
   - Protected routes

2. **Dashboard**
   - View user statistics
   - Quick actions

3. **API Endpoints**
   - Test with Postman or browser
   - Check health endpoint

4. **File Uploads**
   - Test image uploads (when implemented)

## 🚀 Next Steps

After setup is complete:

1. **Complete remaining UI components**
2. **Implement search and filters**
3. **Add creator profile pages**
4. **Set up payment testing**
5. **Deploy to production**

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables
3. Ensure MongoDB connection is working
4. Check if all dependencies are installed

Happy coding! 🎉
