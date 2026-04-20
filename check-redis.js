import dotenv from 'dotenv';
import { createClient } from 'redis';

// Load environment variables from .env
dotenv.config();

async function checkRedis() {
  console.log('Connecting to Redis...');
  
  // Create client using connection string from .env
  const client = createClient({ 
    url: process.env.REDIS_URL 
  });

  // Handle connection errors
  client.on('error', (err) => console.log('Redis Client Error', err));

  try {
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Get all keys
    const keys = await client.keys('*');
    
    if (keys.length === 0) {
      console.log('No keys currently found in Redis.');
    } else {
      console.log(`Found ${keys.length} keys in Redis:`);
      
      // Loop through and print out each key and its value
      for (const key of keys) {
        const type = await client.type(key);
        let value;
        
        if (type === 'string') {
          value = await client.get(key);
        } else {
          // If it's a hash, list, set, etc., we just show the type for now
          value = `[${type} data structure]`;
        }
        
        console.log(`- ${key}: ${value}`);
      }
    }

  } catch (err) {
    console.error('Failed to query Redis:', err);
  } finally {
    console.log('\nDisconnecting...');
    await client.disconnect();
  }
}

checkRedis();
