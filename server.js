if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

//importing
const express = require('express');
const mongoose = require('mongoose');
const {v4 : uuid} = require('uuid');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Room = require('./models/room');
const User = require('./models/user');


//app config
const app = express();
const port = process.env.PORT || 8080;

//DB config

mongoose.connect(process.env.DB_URL,{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
}).then(() => {
    console.log("DB Connected");
})
.catch(err => {
    console.log("Connection Error");
    console.log(err);
});


//middlewares
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
}))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//api routes
app.get('/',(req,res)=>{
    res.status(200).send("Hello");
});

app.post('/api/v1/room',async(req,res)=>{
    try{
        const participants = req.body.participants;
        const id = uuid();
        const obj = {
            _id : id,
            name : req.body.roomname,
        }
        await Room.create(obj, async(err,data)=>{
            if(err){
                res.status(500).send(err);
            }else{
                for(i=0;i<participants.length;i++){
                    console.log(participants[i]);
                    await User.updateOne({email:participants[i]},{$push:{rooms:{$each:[id]}}});
                }
                res.status(201).send(data);
            }
        });
    }
    catch(error){
        console.log(error);
    }
});

app.get('/api/v1/room/:id',async(req,res)=>{
    try{
        await Room.findById(req.params.id,(err,data)=>{
                res.status(200).send(data.messages);
        });
    }catch(e){
        res.status(500).send(e);
    }
});

app.post('/api/v1/room/:id',async(req,res)=>{
    try{
        console.log(req.body);
        await Room.updateOne({_id:req.params.id},{$push:{messages:{$each:[req.body]}}},(err,data)=>{
                res.status(200).send(data);
        });
    }catch(e){
        res.status(500).send(e);
    }
});

app.use(require('./routes/auth'));

//listener
app.listen(port,()=>{
    console.log(`Listening at localhost:${port}`);
})