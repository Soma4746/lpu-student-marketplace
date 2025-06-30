# LPU Student Marketplace

A full-stack web application for LPU (Lovely Professional University) students to buy and sell used items, handmade products, and digital services.

## 🚀 Features

### Core Marketplace
- **Buy & Sell Used Items**: Books, electronics, hostel supplies, etc.
- **Item Listings**: Title, price, description, category, images
- **Payment Options**: UPI ID and Razorpay integration
- **Search & Filter**: By category, keyword, price range
- **Contact Sellers**: Email and WhatsApp integration

### Talent Store
- **Handmade Items**: Art, crafts, custom products
- **Digital Products**: Notes, code, designs (downloadable)
- **Freelance Services**: Tutoring, design, development
- **Creator Profiles**: Public pages with bio, portfolio, contact info

### User Features
- **JWT Authentication**: Secure login/register system
- **User Profiles**: Personal dashboard and settings
- **Wishlist**: Save favorite items
- **Admin Dashboard**: Content management and moderation

## 🛠️ Tech Stack

### Frontend
- **React.js** with React Router
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing

### Payment & Storage
- **Razorpay** for payment processing
- **Cloudinary** for image storage (optional)
- **Local storage** for file uploads

## 📁 Project Structure

```
lpu-marketplace/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/
│   └── package.json
├── README.md
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd lpu-marketplace
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

4. **Environment Setup**
Create `.env` files in both client and server directories (see sample files)

5. **Start the application**

Backend (Terminal 1):
```bash
cd server
npm run dev
```

Frontend (Terminal 2):
```bash
cd client
npm start
```

## 🔧 Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lpu-marketplace
JWT_SECRET=your-jwt-secret-key
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Talent Store
- `GET /api/talent` - Get all talent products
- `POST /api/talent` - Create talent product
- `GET /api/talent/:id` - Get talent product by ID

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## 🚀 Deployment

### Backend (Render/Railway)
1. Create account on Render or Railway
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Create account on Vercel or Netlify
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `build`
5. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🚀 Live Demo

- **Frontend**: https://harmonious-dodol-07d61c.netlify.app
- **Backend**: https://lpu-student-marketplace.onrender.com

## 👥 Team

Built for LPU students by LPU students.

---

**Happy Trading! 🛍️**
