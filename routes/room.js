const express = require('express');
const Room = require('../models/room');
const router = express.Router();
const User = require('../models/user');

// router.post('/api/v1/create_room',async(req,res)=>{
//     try{
//         // console.log(req.body);
//         const {members,body,from,time} = req.body;
//         const messages = [{body:body,
//                             from:from,
//                             time:time}]
//         const room = new Room({members:members,messages:messages});
//         await Room.create(room, async(err,data)=>{
//             if(err){
//                 res.send({message:err,status:500});
//             }else{
//                 for(i=0;i<members.length;i++){
//                     let roomName;
//                     if(i===0){
//                         roomName = members[1];
//                     }else{
//                         roomName = members[0];
//                     }
//                     const obj = {
//                         name:roomName,
//                         _id:room._id
//                     }
//                     await User.updateOne({username:members[i]},{$push:{rooms:{$each:[obj]}}});
//                 }
//                 res.send({message:"Room created successfully",status:200,room:data});
//             }
//         });
//     }
//     catch(error){
//         res.send({message:error,status:501});
//     }
// });

router.get('/api/v1/room/:id',async(req,res)=>{
    try{
        // console.log(req.params.id);
        if(req.params.id){
        await Room.findById(req.params.id,(err,data)=>{
            if(err){
                res.send({message:err,status:500});
            }else{
                // console.log(data);
            res.send({message:"Got all messages in room",status:200,room:data});
            }
        });}
        else{
            res.send({message:"Please provide the room ID",status:500});
        }
    }catch(err){
        res.send({message:err,status:500});
    }
});

// router.post('/api/v1/room/send_message/:id',async(req,res)=>{
//     try{
//         if(req.params.id){
//             Room.updateOne({_id:req.params.id},{$push:{messages:req.body}},(err,data)=>{
//             if(err){
//                 res.send({message:err,status:500});
//             }else{
//                 console.log("message received at server");
//                 res.send({message:"Message Send Successfully",status:200,room:data});
//                 }
//             });}
//         else{
//             res.send({message:"Please provide the room ID",status:500});
//         }
//     }catch(err){
//         res.send({message:err,status:500});
//     }
// });

// router.post('/api/v1/room/delete_room/:id',async(req,res)=>{
//     try{
//         if(req.params.id){
//             Room.remove({_id:req.params.id},(err,data)=>{
//             if(err){
//                 res.send({message:err,status:500});
//             }else{
//                 res.send({message:"Chat Cleared Successfully",status:200,room:data});
//                 }
//             });}
//         else{
//             res.send({message:"Please provide the room ID",status:500});
//         }
//     }catch(err){
//         res.send({message:err,status:500});
//     }
// });

module.exports = router;