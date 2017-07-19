
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
//var autoIncrement = require('mongoose-auto-increment');

const MusicSchema = new Schema({
    musicName : String

})

//UserSchema.plugin({ model : 'User' , field : 'userID' });
module.exports = mongoose.model('Music', MusicSchema)