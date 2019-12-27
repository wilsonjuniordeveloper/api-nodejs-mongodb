const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://bookcast:25553245@cluster0-1e7xq.mongodb.net/test?retryWrites=true&w=majority');
mongoose.Promise = global.Promise;

module.exports = mongoose;

