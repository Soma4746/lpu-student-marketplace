const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Item = require('../models/Item');
const TalentProduct = require('../models/TalentProduct');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample categories data
const categoriesData = [
  {
    name: 'Books & Study Material',
    description: 'Textbooks, notes, and study materials',
    icon: 'book-open',
    color: '#3B82F6',
    subcategories: [
      { name: 'Engineering Books', slug: 'engineering-books' },
      { name: 'Management Books', slug: 'management-books' },
      { name: 'Medical Books', slug: 'medical-books' },
      { name: 'Study Notes', slug: 'study-notes' },
      { name: 'Previous Year Papers', slug: 'previous-year-papers' }
    ],
    isFeatured: true,
    order: 1
  },
  {
    name: 'Electronics',
    description: 'Laptops, phones, gadgets, and accessories',
    icon: 'laptop',
    color: '#10B981',
    subcategories: [
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Mobile Phones', slug: 'mobile-phones' },
      { name: 'Tablets', slug: 'tablets' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Gaming', slug: 'gaming' }
    ],
    isFeatured: true,
    order: 2
  },
  {
    name: 'Fashion & Clothing',
    description: 'Clothes, shoes, and fashion accessories',
    icon: 'shirt',
    color: '#F59E0B',
    subcategories: [
      { name: 'Men\'s Clothing', slug: 'mens-clothing' },
      { name: 'Women\'s Clothing', slug: 'womens-clothing' },
      { name: 'Footwear', slug: 'footwear' },
      { name: 'Accessories', slug: 'fashion-accessories' },
      { name: 'Bags', slug: 'bags' }
    ],
    isFeatured: true,
    order: 3
  },
  {
    name: 'Hostel Supplies',
    description: 'Room essentials and hostel necessities',
    icon: 'home',
    color: '#8B5CF6',
    subcategories: [
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Kitchen Items', slug: 'kitchen-items' },
      { name: 'Bedding', slug: 'bedding' },
      { name: 'Storage', slug: 'storage' },
      { name: 'Appliances', slug: 'appliances' }
    ],
    isFeatured: true,
    order: 4
  },
  {
    name: 'Sports & Fitness',
    description: 'Sports equipment and fitness gear',
    icon: 'dumbbell',
    color: '#EF4444',
    subcategories: [
      { name: 'Gym Equipment', slug: 'gym-equipment' },
      { name: 'Sports Gear', slug: 'sports-gear' },
      { name: 'Outdoor Sports', slug: 'outdoor-sports' },
      { name: 'Fitness Accessories', slug: 'fitness-accessories' }
    ],
    order: 5
  },
  {
    name: 'Vehicles',
    description: 'Bikes, cycles, and vehicle accessories',
    icon: 'bike',
    color: '#06B6D4',
    subcategories: [
      { name: 'Bicycles', slug: 'bicycles' },
      { name: 'Motorcycles', slug: 'motorcycles' },
      { name: 'Vehicle Accessories', slug: 'vehicle-accessories' },
      { name: 'Spare Parts', slug: 'spare-parts' }
    ],
    order: 6
  }
];

// Sample users data
const usersData = [
  {
    name: 'Admin User',
    email: 'admin@lpu.co.in',
    password: 'admin123',
    role: 'admin',
    university: 'Lovely Professional University',
    program: 'Administration',
    year: 'Staff',
    isVerified: true
  },
  {
    name: 'John Doe',
    email: 'john.doe@lpu.co.in',
    password: 'password123',
    phone: '9876543210',
    university: 'Lovely Professional University',
    program: 'B.Tech Computer Science',
    year: '3rd Year',
    hostel: 'Boys Hostel 1',
    room: 'A-101',
    whatsapp: '9876543210',
    bio: 'Computer Science student passionate about technology and coding.',
    upiId: 'john.doe@paytm',
    isVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@lpu.co.in',
    password: 'password123',
    phone: '9876543211',
    university: 'Lovely Professional University',
    program: 'MBA Marketing',
    year: '2nd Year',
    hostel: 'Girls Hostel 2',
    room: 'B-205',
    whatsapp: '9876543211',
    bio: 'MBA student with interests in digital marketing and entrepreneurship.',
    upiId: 'jane.smith@gpay',
    socialLinks: {
      instagram: 'jane_smith_official',
      linkedin: 'https://linkedin.com/in/janesmith'
    },
    isVerified: true
  },
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@lpu.co.in',
    password: 'password123',
    phone: '9876543212',
    university: 'Lovely Professional University',
    program: 'B.Des Graphic Design',
    year: '4th Year',
    hostel: 'Boys Hostel 3',
    room: 'C-301',
    whatsapp: '9876543212',
    bio: 'Graphic designer and digital artist. Available for freelance projects.',
    upiId: 'alex.johnson@phonepe',
    socialLinks: {
      instagram: 'alex_designs',
      behance: 'alexjohnson'
    },
    isVerified: true
  }
];

// Seed functions
const seedCategories = async () => {
  try {
    console.log('🌱 Seeding categories...');
    
    // Clear existing categories
    await Category.deleteMany({});
    
    // Create categories
    for (const categoryData of categoriesData) {
      await Category.create(categoryData);
    }
    
    console.log('✅ Categories seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding users...');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create users
    for (const userData of usersData) {
      // Hash password
      const salt = await bcrypt.genSalt(12);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      await User.create(userData);
    }
    
    console.log('✅ Users seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

const seedSampleItems = async () => {
  try {
    console.log('🌱 Seeding sample items...');
    
    // Get categories and users
    const categories = await Category.find({});
    const users = await User.find({ role: 'user' });
    
    if (categories.length === 0 || users.length === 0) {
      console.log('⚠️ No categories or users found. Skipping items seeding.');
      return;
    }
    
    // Clear existing items
    await Item.deleteMany({});
    
    const sampleItems = [
      {
        title: 'Engineering Mathematics Textbook',
        description: 'Complete textbook for Engineering Mathematics. Excellent condition with minimal highlighting.',
        price: 450,
        originalPrice: 800,
        category: categories.find(c => c.name === 'Books & Study Material')?._id,
        condition: 'Good',
        images: [{ url: '/placeholder-book.jpg', alt: 'Engineering Mathematics Book' }],
        seller: users[0]._id,
        tags: ['mathematics', 'engineering', 'textbook'],
        specifications: {
          brand: 'McGraw Hill',
          year: 2023
        },
        negotiable: true
      },
      {
        title: 'MacBook Air M1 (2020)',
        description: 'Excellent condition MacBook Air with M1 chip. Perfect for students. Includes charger and original box.',
        price: 65000,
        originalPrice: 92900,
        category: categories.find(c => c.name === 'Electronics')?._id,
        condition: 'Like New',
        images: [{ url: '/placeholder-laptop.jpg', alt: 'MacBook Air' }],
        seller: users[1]._id,
        tags: ['laptop', 'macbook', 'apple', 'm1'],
        specifications: {
          brand: 'Apple',
          model: 'MacBook Air',
          year: 2020,
          color: 'Space Gray'
        },
        negotiable: false,
        urgent: true
      },
      {
        title: 'Study Table with Chair',
        description: 'Wooden study table with matching chair. Perfect for hostel room. Good condition.',
        price: 2500,
        category: categories.find(c => c.name === 'Hostel Supplies')?._id,
        condition: 'Good',
        images: [{ url: '/placeholder-furniture.jpg', alt: 'Study Table' }],
        seller: users[2]._id,
        tags: ['furniture', 'table', 'chair', 'study'],
        specifications: {
          color: 'Brown',
          material: 'Wood'
        },
        negotiable: true
      }
    ];
    
    for (const itemData of sampleItems) {
      await Item.create(itemData);
    }
    
    console.log('✅ Sample items seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding items:', error);
  }
};

const seedSampleTalentProducts = async () => {
  try {
    console.log('🌱 Seeding sample talent products...');
    
    const users = await User.find({ role: 'user' });
    
    if (users.length === 0) {
      console.log('⚠️ No users found. Skipping talent products seeding.');
      return;
    }
    
    // Clear existing talent products
    await TalentProduct.deleteMany({});
    
    const sampleTalentProducts = [
      {
        name: 'Custom Logo Design',
        description: 'Professional logo design for your business or personal brand. Includes 3 concepts, unlimited revisions, and final files in multiple formats.',
        price: 1500,
        category: 'Design',
        type: 'digital',
        deliveryType: '1-3_days',
        images: [{ url: '/placeholder-logo.jpg', alt: 'Logo Design Sample' }],
        creator: users[2]._id,
        tags: ['logo', 'design', 'branding', 'graphic'],
        specifications: {
          format: 'AI, PNG, JPG, SVG',
          level: 'Professional',
          includes: ['3 concepts', 'Unlimited revisions', 'Source files', 'Multiple formats']
        },
        pricing: {
          basePrice: 1500,
          packages: [
            {
              name: 'Basic',
              price: 1500,
              deliveryTime: '3 days',
              features: ['1 logo concept', '3 revisions', 'PNG & JPG files']
            },
            {
              name: 'Standard',
              price: 2500,
              deliveryTime: '2 days',
              features: ['3 logo concepts', 'Unlimited revisions', 'All file formats', 'Social media kit']
            }
          ]
        }
      },
      {
        name: 'Web Development Course Notes',
        description: 'Comprehensive notes covering HTML, CSS, JavaScript, React, and Node.js. Perfect for beginners and intermediate learners.',
        price: 500,
        category: 'Code',
        type: 'digital',
        deliveryType: 'instant',
        images: [{ url: '/placeholder-notes.jpg', alt: 'Web Development Notes' }],
        files: [
          { name: 'HTML_CSS_Notes.pdf', url: '/sample-notes.pdf', size: 2048000, type: 'pdf' },
          { name: 'JavaScript_Guide.pdf', url: '/sample-js.pdf', size: 1536000, type: 'pdf' }
        ],
        creator: users[0]._id,
        tags: ['web development', 'programming', 'notes', 'tutorial'],
        specifications: {
          format: 'PDF',
          language: 'English',
          level: 'Beginner to Intermediate',
          includes: ['Code examples', 'Practice exercises', 'Project ideas']
        }
      },
      {
        name: 'Mathematics Tutoring',
        description: 'One-on-one mathematics tutoring for engineering students. Covers calculus, linear algebra, and differential equations.',
        price: 300,
        category: 'Tutoring',
        type: 'service',
        deliveryType: 'custom',
        customDeliveryTime: 'Flexible scheduling',
        images: [{ url: '/placeholder-tutoring.jpg', alt: 'Math Tutoring' }],
        creator: users[1]._id,
        tags: ['tutoring', 'mathematics', 'engineering', 'calculus'],
        specifications: {
          duration: '1 hour per session',
          level: 'Engineering level',
          includes: ['Personalized teaching', 'Practice problems', 'Doubt clearing']
        },
        availability: {
          slots: 10,
          bookedSlots: 3
        }
      }
    ];
    
    for (const productData of sampleTalentProducts) {
      await TalentProduct.create(productData);
    }
    
    console.log('✅ Sample talent products seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding talent products:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    
    await connectDB();
    
    await seedCategories();
    await seedUsers();
    await seedSampleItems();
    await seedSampleTalentProducts();
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Update category stats
    console.log('📊 Updating category statistics...');
    const categories = await Category.find({});
    for (const category of categories) {
      await category.updateItemCount();
    }
    
    console.log('✅ All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  seedCategories,
  seedUsers,
  seedSampleItems,
  seedSampleTalentProducts
};
