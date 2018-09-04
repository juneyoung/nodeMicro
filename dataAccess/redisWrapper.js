const redis = require('redis');
const redisWrapper = redis.createClient();
redisWrapper.on('error',  (err) => {
	console.error('Redis Error ', err);
})

module.exports = redisWrapper;