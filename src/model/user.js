"use strict";

let mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    _id: String,
    displayName: String,
    skype: String,
    image: String,
});
const User = mongoose.model('user', userSchema);
var user1 = new User({_id:"a", displayName: "taro", skype:"hoge", image:"fuga"});

//export default mongoose.model('User', userSchema);
