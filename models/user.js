const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const autoIncrement = require('mongoose-auto-increment');

const UserSchema = new Schema({
    userID :  {
        type : String,
        required: [true, '아이디는 필수입니다.']
    },
    userPassword :  {
        type : String,
        required: [true, '패스워드는 필수입니다.']
    },
    displayName : String
})

autoIncrement.initialize(mongoose.connection)
UserSchema.plugin(autoIncrement.plugin, { model : 'user' , field : 'id',  startAt : 1 });
module.exports = mongoose.model('User', UserSchema)