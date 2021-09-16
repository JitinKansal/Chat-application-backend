const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    members:[
        {
            type:String,
        }
    ],
    messages:[
        {
            body: {
                type: String,
                required: true,
             },
            from:{
                type: String,
                required: true,
             },
            time: {
                type: String,
                // required: true,
            },
        }
    ],
});


const Room = mongoose.model('Room',roomSchema);

module.exports = Room;