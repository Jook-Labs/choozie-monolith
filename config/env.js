const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    awsAccesKey: process.env.AWS_ACCESS_KEY === undefined ? "" : process.env.AWS_ACCESS_KEY,
    awsSecretAccesKey: process.env.AWS_SECRET_ACCESS_KEY === undefined ? "" : process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.BUCKET === undefined ? "" : process.env.BUCKET,
    region: process.env.REGION === undefined ? "" : process.env.REGION,
    awsLink: process.env.AWS_LINK === undefined ? "" : process.env.AWS_LINK,
    apiVersion: process.env.API_VERSION === undefined ? "" : process.env.API_VERSION,
    mongoUri: process.env.MONGO_URI === undefined ? "" : process.env.MONGO_URI,
    openAIKey: process.env.OPENAI_API_KEY === undefined ? "" : process.env.OPENAI_API_KEY,
    jwtKey: process.env.JWT_KEY === undefined ? "" : process.env.JWT_KEY,
    stripeSecretLiveKey: process.env.STRIPE_SECRET_LIVE_KEY === undefined ? "" : process.env.STRIPE_SECRET_LIVE_KEY,
    stripePubLiveKey: process.env.STRIPE_PUB_LIVE_KEY === undefined ? "" : process.env.STRIPE_PUB_LIVE_KEY,
    
    stripeSecretTestKey: process.env.STRIPE_SECRET_TEST_KEY === undefined ? "" : process.env.STRIPE_SECRET_TEST_KEY,
    stripePubTestKey: process.env.STRIPE_PUB_TEST_KEY === undefined ? "" : process.env.STRIPE_PUB_TEST_KEY,
};