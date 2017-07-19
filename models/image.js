/**
 * Created by choedongho on 2017. 7. 16..
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
//var autoIncrement = require('mongoose-auto-increment');

const ImageSchema = new Schema({
    imageName : String

})

//UserSchema.plugin({ model : 'User' , field : 'userID' });
module.exports = mongoose.model('Image', ImageSchema)