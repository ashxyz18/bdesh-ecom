const http = require('http');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': 'session=dummy' },
      body: JSON.stringify({ name: 'Test', subdomain: 'test1234', category: 'default' })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
