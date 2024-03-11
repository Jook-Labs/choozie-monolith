let aws = require('./AWS.js')
let db = require('./database.js')
let env = require('./env.js')

var setupConfigs = () => {
    db.connectDatabase(env)
}

module.exports = { setupConfigs }