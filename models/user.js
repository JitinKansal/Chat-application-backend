const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose'); 

const userSchema = mongoose.Schema({
    emailId:{
        type: String,
        required: true,
     },
     online:{
        type: Boolean,
        default: false,
     },
    rooms:[{
         type :String,
        }
    ]
});

userSchema.plugin(passportLocalMongoose); 

const User = mongoose.model('User',userSchema);

module.exports = User;