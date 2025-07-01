const axios = require('axios');

async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');
    
    const userData = {
      name: 'Test User',
      email: 'test@lpu.co.in',
      password: 'Test123',
      phone: '1234567890',
      program: 'Computer Science',
      year: '1st Year'
    };
    
    console.log('Sending data:', userData);
    
    const response = await axios.post(
      'https://lpu-student-marketplace.onrender.com/api/auth/register',
      userData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data);
    console.log('Full error:', error.message);
  }
}

testRegistration();
