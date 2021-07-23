const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

router.post('/api/v1/user/register',async(req,res)=>{
    try{
        const {name,emailId,password} = req.body;
        console.log(req.body);
        const user = new User({username:name,emailId:emailId});
        const newUser = await User.register(user,password);
        res.status(201).json({message : "User registered successfully"});
    }
    catch(err){
        res.status(500).json({error:err});
    }
   
});

router.post('/api/v1/user/login',passport.authenticate('local', { session: false }),(req,res)=> {
    try{
        res.json({message : "Successfully login"});
    }
    catch(err){
        res.json({message : "name/password is incorrect"});
    }
}
);


module.exports = router;