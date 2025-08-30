// 简单的API测试脚本
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('Testing ROX API...');
  
  try {
    // 测试健康检查
    console.log('\n1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✓ Health check passed:', healthResponse.data);
    
    // 测试获取访问次数
    console.log('\n2. Testing get visits...');
    const getResponse = await axios.get(`${API_BASE}/api/stats/visits`);
    console.log('✓ Get visits:', getResponse.data);
    
    // 测试增加访问次数
    console.log('\n3. Testing increment visits...');
    const postResponse = await axios.post(`${API_BASE}/api/stats/visit`);
    console.log('✓ Increment visits:', postResponse.data);
    
    // 再次获取访问次数验证
    console.log('\n4. Testing get visits again...');
    const getResponse2 = await axios.get(`${API_BASE}/api/stats/visits`);
    console.log('✓ Get visits after increment:', getResponse2.data);
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// 运行测试
testAPI();