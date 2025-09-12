// Complete cache clearing script for entire football backend project
const { createClient } = require('redis');

async function clearAllCache() {
  let redisClient;
  
  try {
    console.log('🚀 Football Backend - Complete Cache Clear\n');
    
    // Initialize Redis client (same as in your app)
    redisClient = createClient();
    await redisClient.connect();
    console.log('✅ Connected to Redis\n');
    
    // Get all keys first to show what we're clearing
    const allKeys = await redisClient.keys('*');
    console.log(`📋 Found ${allKeys.length} total cache keys in Redis\n`);
    
    if (allKeys.length > 0) {
      console.log('🔍 Current cache keys:');
      
      // Categorize keys for better visibility
      const categories = {
        leagues: [],
        teams: [],
        players: [],
        standings: [],
        fixtures: [],
        statistics: [],
        search: [],
        other: []
      };
      
      allKeys.forEach(key => {
        if (key.includes('league')) categories.leagues.push(key);
        else if (key.includes('team')) categories.teams.push(key);
        else if (key.includes('player')) categories.players.push(key);
        else if (key.includes('standing')) categories.standings.push(key);
        else if (key.includes('fixture')) categories.fixtures.push(key);
        else if (key.includes('stat')) categories.statistics.push(key);
        else if (key.includes('search')) categories.search.push(key);
        else categories.other.push(key);
      });
      
      // Display categorized keys
      Object.entries(categories).forEach(([category, keys]) => {
        if (keys.length > 0) {
          console.log(`\n📂 ${category.toUpperCase()} (${keys.length} keys):`);
          keys.forEach(key => console.log(`   🔹 ${key}`));
        }
      });
      
      console.log('\n💥 CLEARING ALL CACHE DATA...\n');
      
      // Clear all keys at once (fastest method)
      await redisClient.flushAll();
      
      console.log('✅ Successfully cleared ALL cache data!');
      console.log(`🗑️  Removed ${allKeys.length} cache keys`);
      
      // Verify clearing worked
      const remainingKeys = await redisClient.keys('*');
      if (remainingKeys.length === 0) {
        console.log('✅ Verification: Cache is completely empty');
      } else {
        console.log(`⚠️  Warning: ${remainingKeys.length} keys still remain`);
      }
      
    } else {
      console.log('ℹ️  Redis cache is already empty - nothing to clear');
    }
    
    await redisClient.disconnect();
    console.log('\n🔌 Disconnected from Redis');
    console.log('\n🎉 Cache clearing complete!');
    console.log('📝 Next API requests will fetch fresh data from external APIs');
    
  } catch (error) {
    console.error('\n❌ Error clearing cache:', error.message);
    if (redisClient) {
      try {
        await redisClient.disconnect();
      } catch (disconnectError) {
        console.error('Failed to disconnect Redis:', disconnectError.message);
      }
    }
    process.exit(1);
  }
}

// Add some helpful information
console.log('🧹 Football Backend Cache Cleaner');
console.log('🎯 This will clear ALL cached data including:');
console.log('   • Leagues data');
console.log('   • Teams data');
console.log('   • Players data');
console.log('   • Standings data');
console.log('   • Fixtures data');
console.log('   • Statistics data');
console.log('   • Search results');
console.log('   • All other cached responses\n');

clearAllCache();