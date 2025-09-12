// Script to clear ALL cache keys related to league 39
const { createClient } = require('redis');

async function clearCache() {
  let redisClient;
  
  try {
    // Initialize Redis client (same as in your app)
    redisClient = createClient();
    await redisClient.connect();
    
    console.log('🔍 Checking ALL cache keys...\n');
    
    // Get all keys
    const allKeys = await redisClient.keys('*');
    console.log(`📋 Total cache keys in Redis: ${allKeys.length}`);
    
    if (allKeys.length > 0) {
      console.log('\n� All cache keys:');
      allKeys.forEach(key => console.log(`  - ${key}`));
    }
    
    // Filter league 39 related keys
    const league39Keys = allKeys.filter(key => 
      key.includes('39') || 
      key.includes('league') || 
      key.includes('standings') || 
      key.includes('teams')
    );
    
    if (league39Keys.length > 0) {
      console.log(`\n🎯 League 39 related keys (${league39Keys.length}):`);
      league39Keys.forEach(key => console.log(`  - ${key}`));
      
      console.log(`\n🧹 Clearing ${league39Keys.length} cache keys...\n`);
      
      for (const key of league39Keys) {
        const result = await redisClient.del(key);
        if (result === 1) {
          console.log(`✅ Successfully cleared: ${key}`);
        } else {
          console.log(`⚠️  Key not found: ${key}`);
        }
      }
    } else {
      console.log('\n❌ No league 39 related keys found');
    }
    
    // Also clear ALL keys (nuclear option)
    console.log('\n💥 NUCLEAR OPTION: Clear ALL cache keys? (uncomment next line if needed)');
    // await redisClient.flushAll();
    // console.log('💥 Cleared ALL cache keys');
    
    await redisClient.disconnect();
    console.log('\n✨ Done!');
    
  } catch (error) {
    console.error('❌ Error clearing cache:', error.message);
    if (redisClient) {
      await redisClient.disconnect();
    }
    process.exit(1);
  }
}

clearCache();