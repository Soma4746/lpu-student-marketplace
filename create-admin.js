// Script to create admin user
const mongoose = require('mongoose');
require('dotenv').config();

// User model (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  permissions: [String]
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://lpuadmin:Soma4746@cluster0.zstnls7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@lpu.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@lpu.com');
      console.log('Updating role to admin...');
      
      existingAdmin.role = 'admin';
      existingAdmin.permissions = [
        'manage_users',
        'manage_items', 
        'manage_talent',
        'view_analytics',
        'moderate_content',
        'manage_categories',
        'system_settings'
      ];
      await existingAdmin.save();
      console.log('✅ Admin role updated!');
    } else {
      // Create new admin user
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = new User({
        name: 'LPU Admin',
        email: 'admin@lpu.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        permissions: [
          'manage_users',
          'manage_items', 
          'manage_talent',
          'view_analytics',
          'moderate_content',
          'manage_categories',
          'system_settings'
        ]
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully!');
      console.log('Email: admin@lpu.com');
      console.log('Password: admin123');
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
}

createAdmin();
