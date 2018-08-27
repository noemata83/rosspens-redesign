const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

const client = redis.createClient(keys.REDIS_URL);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this._cache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
}

mongoose.Query.prototype.exec = async function() {
  if (!this._cache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name,
  })).replace(/"/g, "'");

  // check redis to see if we have a value for the key created

  const cachedValue = await client.hget(this.hashKey, key);

  if (cachedValue) {
    const doc = JSON.parse(cachedValue.replace(/'/g, '"'));
    return Array.isArray(doc) 
      ? doc.map(record => new this.model(record))
      : new this.model(JSON.parse(cachedValue.replace(/'/g, '"')));
  }

  // if not, execute the query as normal, return and save the result in redis.
  
  const result = await exec.apply(this, arguments);
  console.log("hashKey: ", this.hashKey);
  console.log("key", key);
  console.log("value", JSON.stringify(result).replace(/"/g, "'"));
  client.hset(this.hashKey, key, JSON.stringify(result).replace(/"/g, "'"), 'EX', 10000);
  return result;
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
