const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

router.post('/api/v1/user/register',async(req,res)=>{
    try{
        const {username,email,password} = req.body;
        console.log(req.body);
        const user = new User({username:username,emailId:email});
        const newUser = await User.register(user,password);
        res.send({message : "User registered successfully",status:201,username:username});
    }
    catch(err){
        res.send({message:err,status:501});
    }
});

router.post('/api/v1/user/login',passport.authenticate('local'),async (req,res)=>{
    const data={
        name:req.user.username,
        rooms:req.user.rooms,
        email:req.user.emailId,
        id: req.user._id,
        isOnline:req.user.online,
    }
    const allUsers = await User.find({});
    var otherUsers = [];
    for(let i=0;i<allUsers.length;i++)
    {
        let obj={
            isOnline:allUsers[i].online,
            user:allUsers[i].username,
            id:allUsers[i]._id,
            emailId:allUsers[i].emailId,
        }
        otherUsers.push(obj);
    }
    res.send({message : "Successfully login",status:201,user:data,otherUsers:otherUsers});
});

router.get('/api/v1/user/logout',(req,res)=>{
    req.logout({message : "Successfully login",status:201,user:req.user});
    res.send({message : "Successfully login",status:201,user:req.user});
});

module.exports = router;