const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({
      message: 'LPU Marketplace connection test successful!'
    });
    
    await testDoc.save();
    console.log('✅ Test document created successfully!');
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.connection.close();
    console.log('🎉 Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Tip: Check your username and password in the connection string');
    } else if (error.message.includes('network')) {
      console.log('💡 Tip: Check your network access settings in MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Tip: Check your connection string format');
    }
    
    process.exit(1);
  }
};

testConnection();
