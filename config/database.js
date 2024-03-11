const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

 var connectDatabase = (env) => {
    mongoose.connect(env.mongoUri, {})
        .then(() => console.log('Mongoose Connected'))
        .catch(err => console.log(err));
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log("Database Connected")
    });
};

module.exports = { connectDatabase };