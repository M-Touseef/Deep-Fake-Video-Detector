const readResponse = async (response, fallback) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      throw new Error(payload.errors.map((err) => err.message).join('\n'));
    }
    throw new Error(payload.error || payload.message || fallback);
  }
  return payload.data !== undefined ? payload.data : payload;
};

async function test() {
  const response = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `test_${Date.now()}@test.com`, password: 'password', name: 'Test' }),
  });
  
  const result = await readResponse(response, 'Signup failed');
  console.log('Returned from apiService:', result);
  console.log('Has Token?', !!result.token);
  console.log('Has User?', !!result.user);
}

test().catch(console.error);
