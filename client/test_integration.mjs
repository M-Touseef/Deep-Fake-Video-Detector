

const BASE_URL = 'http://localhost:3000/api';

async function testBackend() {
  console.log('Testing Health Endpoint...');
  let res = await fetch(`${BASE_URL}/health`);
  let data = await res.json();
  console.log('Health:', data);

  console.log('\nTesting Auth (Signup/Login)...');
  const user = { email: `test_${Date.now()}@test.com`, password: 'password123', name: 'Test User' };
  
  res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  let authData = await res.json();
  console.log('Signup Response:', res.status, authData);

  const token = authData.data?.token;

  if (token) {
    console.log('\nTesting GET /auth/me...');
    res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    let meData = await res.json();
    console.log('Me Response:', res.status, meData);

    console.log('\nTesting GET /video...');
    res = await fetch(`${BASE_URL}/video`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    let videoData = await res.json();
    console.log('Video List Response:', res.status, videoData);

  } else {
    console.log('Signup failed, skipping auth-dependent tests.');
  }

  console.log('\nTesting Admin (Login as admin from .env)...');
  // Need admin credentials, assuming standard or skipped for now
}

testBackend().catch(console.error);
