const mongoose = require('mongoose');

const db = mongoose.connect(process.env.APP_DB)
        .then(()=>console.log('connected mongoose'))
        .catch((err)=>console.log(err));

module.exports = db