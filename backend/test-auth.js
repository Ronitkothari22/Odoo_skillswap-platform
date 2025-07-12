#!/usr/bin/env node

// Simple test script for authentication endpoints
// Run with: node test-auth.js

const BASE_URL = 'http://localhost:5000/api/auth';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

// Helper function to make HTTP requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  
  console.log(`\n--- ${options.method || 'GET'} ${endpoint} ---`);
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
  
  return { response, data };
}

// Test functions
async function testSignup() {
  console.log('🔐 Testing Signup...');
  
  const { response, data } = await makeRequest('/signup', {
    method: 'POST',
    body: JSON.stringify(testUser),
  });
  
  if (response.status === 201 && data.success) {
    console.log('✅ Signup successful');
    return data.session?.access_token;
  } else {
    console.log('❌ Signup failed');
    return null;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  
  const { response, data } = await makeRequest('/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password,
    }),
  });
  
  if (response.status === 200 && data.success) {
    console.log('✅ Login successful');
    return data.session?.access_token;
  } else {
    console.log('❌ Login failed');
    return null;
  }
}

async function testGetCurrentUser(token) {
  console.log('\n👤 Testing Get Current User...');
  
  const { response, data } = await makeRequest('/me', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.status === 200 && data.success) {
    console.log('✅ Get current user successful');
    return true;
  } else {
    console.log('❌ Get current user failed');
    return false;
  }
}

async function testGoogleAuth() {
  console.log('\n🔐 Testing Google OAuth URL Generation...');
  
  const { response, data } = await makeRequest('/google?redirectTo=http://localhost:5173/dashboard');
  
  if (response.status === 200 && data.success) {
    console.log('✅ Google OAuth URL generated successfully');
    console.log('OAuth URL:', data.url);
    return true;
  } else {
    console.log('❌ Google OAuth URL generation failed');
    return false;
  }
}

async function testLogout(token) {
  console.log('\n🚪 Testing Logout...');
  
  const { response, data } = await makeRequest('/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.status === 200 && data.success) {
    console.log('✅ Logout successful');
    return true;
  } else {
    console.log('❌ Logout failed');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Authentication API Tests...');
  console.log('Base URL:', BASE_URL);
  
  try {
    // Test signup
    let token = await testSignup();
    
    // If signup fails (user might already exist), try login
    if (!token) {
      token = await testLogin();
    }
    
    if (token) {
      // Test authenticated endpoints
      await testGetCurrentUser(token);
      await testLogout(token);
    }
    
    // Test Google OAuth (doesn't require authentication)
    await testGoogleAuth();
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Error during tests:', error.message);
  }
}

// Run the tests
if (require.main === module) {
  runTests();
} 