const mongoose = require("mongoose");
const useSchema = new mongoose.Schema({
    name : {type : String, required : true},
    email : {type : String, required : true , unique : true},
    password : {type : String, required : true},
    avatar : {type : String, required : true},
    isAdmin : {type : Boolean, default : false}
}, {timestamps : true});
const UserTable = mongoose.model('user', useSchema);
module.exports = UserTable;