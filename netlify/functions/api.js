const serverless = require('serverless-http');
const app = require('../../backend/app');

module.exports.handler = serverless(app);
