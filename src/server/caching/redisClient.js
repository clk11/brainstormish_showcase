import redis from 'async-redis';

const client = redis.createClient(6379);

// Add all functions from the async-redis library to the client
Object.assign(client, redis);

export default client;
