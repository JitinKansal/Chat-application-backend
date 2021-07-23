const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    _id : {
        type: String,
    },
    name:{
        type: String,
        required: true,
    },
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