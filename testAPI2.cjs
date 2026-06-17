const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://jeans-factory-erp-md8f.vercel.app/api/expenses', {
      date: '2026-06-17',
      reason: 'Test Error 2',
      amount: 100,
      category: 'Meals',
      supplierId: ''
    });
    console.log(res.data);
  } catch (err) {
    console.log('Error Status:', err.response?.status);
    console.log('Error Data:', err.response?.data);
  }
}
test();
