// Simple API test script
const http = require('http');

const baseUrl = 'http://168.231.106.100:3001/';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testAPI() {
  console.log('Testing EVX Backend API...');
  console.log('=' .repeat(50));

  const endpoints = [
    '/api/health',
    '/api/vehicles?limit=5',
    '/api/vehicles/hero',
    '/api/categories',
    '/api/categories/brands',
    '/api/categories/filters'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting: ${endpoint}`);
      const result = await makeRequest(endpoint);
      console.log(`Status: ${result.status}`);

      if (result.status === 200) {
        console.log('✅ Success');
        if (result.data.success) {
          if (Array.isArray(result.data.data)) {
            console.log(`   Data count: ${result.data.data.length}`);
          } else if (typeof result.data.data === 'object') {
            console.log(`   Data keys: ${Object.keys(result.data.data).join(', ')}`);
          }
        }
      } else {
        console.log('❌ Failed');
        console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('API testing completed!');
}

// Run the test
testAPI().catch(console.error);
