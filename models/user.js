const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose'); 

const userSchema = new mongoose.Schema({
    emailId:{
        type: String,
        required: true,
        Unique:true,
     },
     online:{
        type: Boolean,
        default: false,
     },
    rooms:[{
        name:{
            type:String,
        },
        _id:{
            type:String,
        }
        }
    ]
});

userSchema.plugin(passportLocalMongoose); 

const User = mongoose.model('User',userSchema);

module.exports = User;