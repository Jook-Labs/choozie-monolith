let { openAIKey } = require('./env.js')

const OpenAIApi = require("openai");
const openai = new OpenAIApi({key:openAIKey});

module.exports = openai;