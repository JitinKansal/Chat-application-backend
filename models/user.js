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
        },
        seen:{
            type:Boolean,
            default:false,
        },
        unseenMessages:{
            type:Number,
            default:0,
        },
        lastMessage:{
            body: {
                type: String,
                default:"",
             },
            from:{
                type: String,
                default:"",
             },
            time: {
                type: String,
                default:"",
            },
        },
    }],
});

userSchema.plugin(passportLocalMongoose); 

const User = mongoose.model('User',userSchema);

module.exports = User;