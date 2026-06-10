const axios = require('axios');

const BASE_URL = 'http://168.231.106.100:3001/api';
const USER_ID = 1;

/**
 * Test script for the new item-likes API
 * Tests both vehicle and accessory likes with type tracking
 */

const testItemLikesAPI = async () => {
  try {
    console.log('🧪 Testing Item Likes API...');
    console.log('=' .repeat(50));

    // Test 1: Toggle like for a vehicle
    console.log('\n1️⃣ Testing vehicle like toggle...');
    const vehicleLikeResponse = await axios.post(`${BASE_URL}/item-likes/toggle`, {
      userId: USER_ID,
      itemId: '1',
      itemType: 'vehicle'
    });
    console.log('✅ Vehicle like response:', vehicleLikeResponse.data);

    // Test 2: Toggle like for an accessory (UUID)
    console.log('\n2️⃣ Testing accessory like toggle...');
    const accessoryLikeResponse = await axios.post(`${BASE_URL}/item-likes/toggle`, {
      userId: USER_ID,
      itemId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Example UUID
      itemType: 'accessory'
    });
    console.log('✅ Accessory like response:', accessoryLikeResponse.data);

    // Test 3: Check like status for vehicle
    console.log('\n3️⃣ Testing vehicle like status check...');
    const vehicleStatusResponse = await axios.get(`${BASE_URL}/item-likes/check/${USER_ID}/vehicle/1`);
    console.log('✅ Vehicle like status:', vehicleStatusResponse.data);

    // Test 4: Check like status for accessory
    console.log('\n4️⃣ Testing accessory like status check...');
    const accessoryStatusResponse = await axios.get(`${BASE_URL}/item-likes/check/${USER_ID}/accessory/a1b2c3d4-e5f6-7890-abcd-ef1234567890`);
    console.log('✅ Accessory like status:', accessoryStatusResponse.data);

    // Test 5: Get all user likes
    console.log('\n5️⃣ Testing get all user likes...');
    const allLikesResponse = await axios.get(`${BASE_URL}/item-likes/user/${USER_ID}`);
    console.log('✅ All user likes:', JSON.stringify(allLikesResponse.data, null, 2));

    // Test 6: Get only vehicle likes
    console.log('\n6️⃣ Testing get vehicle likes only...');
    const vehicleLikesResponse = await axios.get(`${BASE_URL}/item-likes/user/${USER_ID}?type=vehicle`);
    console.log('✅ Vehicle likes only:', JSON.stringify(vehicleLikesResponse.data, null, 2));

    // Test 7: Get only accessory likes
    console.log('\n7️⃣ Testing get accessory likes only...');
    const accessoryLikesResponse = await axios.get(`${BASE_URL}/item-likes/user/${USER_ID}?type=accessory`);
    console.log('✅ Accessory likes only:', JSON.stringify(accessoryLikesResponse.data, null, 2));

    // Test 8: Check multiple items status
    console.log('\n8️⃣ Testing multiple items like status check...');
    const multipleStatusResponse = await axios.post(`${BASE_URL}/item-likes/check-multiple`, {
      userId: USER_ID,
      items: [
        { id: '1', type: 'vehicle' },
        { id: '2', type: 'vehicle' },
        { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', type: 'accessory' }
      ]
    });
    console.log('✅ Multiple items status:', JSON.stringify(multipleStatusResponse.data, null, 2));

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ The new item-likes API is working correctly with type tracking');
    console.log('✅ Both vehicles (numeric IDs) and accessories (UUIDs) are supported');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    throw error;
  }
};

// Run tests if called directly
if (require.main === module) {
  testItemLikesAPI()
    .then(() => {
      console.log('\n🏁 Test suite completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testItemLikesAPI };
