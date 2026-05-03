
// Using built-in fetch in Node 20

async function test() {
  try {
    const res = await fetch('http://127.0.0.1:8001/api/dashboard');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data keys:', Object.keys(data));
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

test();
