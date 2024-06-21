import redis from 'async-redis';

const client = redis.createClient(6379);

Object.assign(client, redis);

export default client;
