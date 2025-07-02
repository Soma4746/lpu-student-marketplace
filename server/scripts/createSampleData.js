const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Item = require('../models/Item');
const TalentProduct = require('../models/TalentProduct');
const Category = require('../models/Category');

// Sample data
const sampleUsers = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@lpu.co.in',
    password: 'password123',
    phone: '9876543210',
    program: 'B.Tech Computer Science',
    year: '3rd Year',
    hostel: 'Boys Hostel 1',
    room: 'A-101',
    bio: 'Computer Science student passionate about web development and AI.',
    isVerified: true
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@lpu.co.in',
    password: 'password123',
    phone: '9876543211',
    program: 'BBA',
    year: '2nd Year',
    hostel: 'Girls Hostel 1',
    room: 'B-205',
    bio: 'Business student with interests in marketing and entrepreneurship.',
    isVerified: true
  },
  {
    name: 'Arjun Singh',
    email: 'arjun.singh@lpu.co.in',
    password: 'password123',
    phone: '9876543212',
    program: 'B.Tech Electronics',
    year: '4th Year',
    hostel: 'Boys Hostel 2',
    room: 'C-301',
    bio: 'Electronics engineer and photographer.',
    isVerified: true
  },
  {
    name: 'Sneha Gupta',
    email: 'sneha.gupta@lpu.co.in',
    password: 'password123',
    phone: '9876543213',
    program: 'BCA',
    year: '1st Year',
    bio: 'New to programming, eager to learn and grow.',
    isVerified: true
  }
];

const sampleCategories = [
  { name: 'Electronics', slug: 'electronics', description: 'Electronic gadgets and accessories', icon: 'smartphone', color: '#3B82F6' },
  { name: 'Books', slug: 'books', description: 'Academic and reference books', icon: 'book', color: '#10B981' },
  { name: 'Clothing', slug: 'clothing', description: 'Clothes and fashion accessories', icon: 'shirt', color: '#F59E0B' },
  { name: 'Sports', slug: 'sports', description: 'Sports equipment and gear', icon: 'trophy', color: '#EF4444' },
  { name: 'Stationery', slug: 'stationery', description: 'Study materials and stationery', icon: 'pencil', color: '#8B5CF6' },
  { name: 'Programming', slug: 'programming', description: 'Programming and development services', icon: 'code', color: '#06B6D4' },
  { name: 'Design', slug: 'design', description: 'Graphic design and creative services', icon: 'palette', color: '#EC4899' },
  { name: 'Tutoring', slug: 'tutoring', description: 'Academic tutoring and teaching', icon: 'graduation-cap', color: '#84CC16' },
  { name: 'Photography', slug: 'photography', description: 'Photography and videography services', icon: 'camera', color: '#F97316' },
  { name: 'Music', slug: 'music', description: 'Music lessons and performances', icon: 'music', color: '#6366F1' }
];

const sampleItems = [
  {
    title: 'iPhone 13 - Excellent Condition',
    description: 'Selling my iPhone 13 in excellent condition. Used for 1 year, no scratches or damage. Comes with original box and charger.',
    price: 45000,
    condition: 'Like New',
    images: [{ url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500' }],
    isNegotiable: true,
    tags: ['iPhone', 'smartphone', 'apple']
  },
  {
    title: 'Data Structures and Algorithms Book',
    description: 'Comprehensive book on DSA by Cormen. Perfect for competitive programming and interviews.',
    price: 800,
    condition: 'Good',
    images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500' }],
    isNegotiable: true,
    tags: ['book', 'programming', 'algorithms']
  },
  {
    title: 'Gaming Laptop - ASUS ROG',
    description: 'High-performance gaming laptop. RTX 3060, 16GB RAM, 512GB SSD. Perfect for gaming and development.',
    price: 75000,
    condition: 'Good',
    images: [{ url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500' }],
    isNegotiable: true,
    tags: ['laptop', 'gaming', 'asus']
  },
  {
    title: 'Wireless Headphones - Sony WH-1000XM4',
    description: 'Premium noise-cancelling headphones. Great for studying and music. Barely used.',
    price: 15000,
    condition: 'Like New',
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' }],
    isNegotiable: false,
    tags: ['headphones', 'sony', 'wireless']
  },
  {
    title: 'Study Table with Chair',
    description: 'Wooden study table with comfortable chair. Perfect for hostel room or home study.',
    price: 3500,
    condition: 'Good',
    images: [{ url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500' }],
    isNegotiable: true,
    tags: ['furniture', 'study', 'table']
  }
];

const sampleTalentProducts = [
  {
    name: 'Professional Website Development',
    description: 'I will create a modern, responsive website for your business or personal use. Includes React.js, Node.js, and database integration.',
    price: 8000,
    category: 'Code',
    type: 'service',
    deliveryType: '3-7_days',
    images: [{ url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500' }],
    tags: ['web development', 'react', 'nodejs'],
    pricing: {
      basePrice: 8000
    },
    specifications: {
      includes: [
        'Responsive design',
        'Modern UI/UX',
        'Database integration',
        'SEO optimized',
        '1 month support'
      ]
    }
  },
  {
    name: 'Logo Design & Branding',
    description: 'Professional logo design and complete branding package for your startup or business.',
    price: 2500,
    category: 'Design',
    type: 'digital',
    deliveryType: '1-3_days',
    images: [{ url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500' }],
    tags: ['logo design', 'branding', 'graphics'],
    pricing: {
      basePrice: 2500
    },
    specifications: {
      includes: [
        '3 logo concepts',
        'Unlimited revisions',
        'High-resolution files',
        'Brand guidelines',
        'Social media kit'
      ]
    }
  },
  {
    name: 'Math & Physics Tutoring',
    description: 'Expert tutoring in Mathematics and Physics for 11th, 12th, and engineering students.',
    price: 500,
    category: 'Tutoring',
    type: 'service',
    deliveryType: 'instant',
    images: [{ url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500' }],
    tags: ['tutoring', 'math', 'physics'],
    pricing: {
      basePrice: 500
    },
    specifications: {
      includes: [
        'One-on-one sessions',
        'Concept clearing',
        'Problem solving',
        'Exam preparation',
        'Flexible timings'
      ]
    }
  },
  {
    name: 'Event Photography',
    description: 'Professional photography for college events, parties, and celebrations.',
    price: 3000,
    category: 'Photography',
    type: 'service',
    deliveryType: 'within_24h',
    images: [{ url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500' }],
    tags: ['photography', 'events', 'college'],
    pricing: {
      basePrice: 3000
    },
    specifications: {
      includes: [
        'High-quality photos',
        'Quick delivery',
        'Edited images',
        'Online gallery',
        'Print-ready files'
      ]
    }
  },
  {
    name: 'Mobile App Development',
    description: 'Custom mobile app development for Android and iOS using React Native.',
    price: 15000,
    category: 'Code',
    type: 'service',
    deliveryType: 'custom',
    customDeliveryTime: '14 days',
    images: [{ url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500' }],
    tags: ['mobile app', 'react native', 'development'],
    pricing: {
      basePrice: 15000
    },
    specifications: {
      includes: [
        'Cross-platform app',
        'Modern UI design',
        'API integration',
        'App store deployment',
        '3 months support'
      ]
    }
  }
];

async function createSampleData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://lpuadmin:Soma4746@cluster0.zstnls7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Connected to MongoDB');

    // Clear existing sample data to avoid duplicates
    console.log('Clearing existing sample data...');
    await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });
    await Item.deleteMany({});
    await TalentProduct.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    console.log('Creating categories...');
    const categories = await Category.insertMany(sampleCategories);
    console.log(`Created ${categories.length} categories`);

    // Create users
    console.log('Creating users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`Created ${users.length} users`);

    // Create items
    console.log('Creating items...');
    const itemsWithUsers = sampleItems.map((item, index) => ({
      ...item,
      seller: users[index % users.length]._id,
      category: categories[index % 5]._id // First 5 categories for items
    }));
    const items = await Item.insertMany(itemsWithUsers);
    console.log(`Created ${items.length} items`);

    // Create talent products
    console.log('Creating talent products...');
    const talentWithUsers = sampleTalentProducts.map((talent, index) => ({
      ...talent,
      creator: users[index % users.length]._id
      // category is already set in the sample data as string enum
    }));
    const talents = await TalentProduct.insertMany(talentWithUsers);
    console.log(`Created ${talents.length} talent products`);

    console.log('✅ Sample data created successfully!');
    console.log('\nSample users created:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });

    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating sample data:', error);
    mongoose.disconnect();
  }
}

createSampleData();
