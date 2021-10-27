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
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

//app config
const app = express();
const port = process.env.PORT || 4000;

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
app.use(cors({origin: ["http://localhost:3000","http://192.168.0.103:3000"]}));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//api routes
app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html');
});

app.use(require('./routes/auth'));
app.use(require('./routes/room'));


//listener
const server = http.createServer(app);
const io = socketio(server,{
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });


io.on('connection',(socket) => {
    console.log("new connection!!!!!");

    socket.on("joinRoom", (data,fn) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on("create_room", async (data,fn)=>{
        try{
            const {name,members,body,from,time} = data;
            const messages = [{body:body,from:from,time:time}];
            const room = new Room({name:name,members:members,messages:messages});

            await Room.create(room, async(err,res)=>{
                if(err){
                    fn({error:err,status:500});
                }else{
                    if(res.name === undefined){
                        for(i=0;i<members.length;i++){
                            let roomName;
                            if(i===0){
                                roomName = members[1];
                            }else{
                                roomName = members[0];
                            }
                            const obj = {
                                name:roomName,
                                _id:res._id,
                                seen:false,
                                unseenMessages:1,
                                lastMessage:{body:body,from:from,time:time},
                            }
                            await User.updateOne({username:members[i]},{$push:{rooms:{$each:[obj]}}});
                        }
                    }else{
                        const obj = {
                            name:res.name,
                            _id:res._id,
                            seen:false,
                            unseenMessages:1,
                            lastMessage:{body:body,from:from,time:time},
                        }
                        for(i=0;i<members.length;i++){
                            await User.updateOne({username:members[i]},{$push:{rooms:{$each:[obj]}}});
                        }
                    }
                    io.emit("receive_room", res);
                    fn({message:"Room created successfully",status:200,room:res});
                }
            });
        }
        catch(error){
            fn({error:error,status:501});
        }
    });

    socket.on("sendMessage",(data,fn)=>{
        try{
            if(data.roomId){
                Room.updateOne({_id:data.roomId},{$push:{messages:data.message}},async (err,res)=>{
                if(err){
                    fn({error:err,status:500});
                }else{
                    Room.findOne({_id:data.roomId},async (er,room)=>{
                        if(er){
                            console.log("error from findone line number = 140",er);
                        }else{
                            for(let i=0;i<room.members.length;i++){
                                // console.log(room.members[i],data.roomId);
                                // console.log(data.message);
                                if(room.members[i] === data.message.from){
                                    await User.updateOne({ username : room.members[i]},
                                        {$set: { "rooms.$[elem].seen":true,"rooms.$[elem].unseenMessages":0,"rooms.$[elem].lastMessage":data.message}},
                                        {arrayFilters: [{ "elem._id": data.roomId}]},(err,res)=>{
                                            // console.log(res);
                                    });
                                }
                                else{
                                    await User.updateOne({ username : room.members[i]},
                                        {$set: { "rooms.$[elem].seen":false,"rooms.$[elem].unseenMessages":1,"rooms.$[elem].lastMessage":data.message}},
                                        {arrayFilters: [{ "elem._id": data.roomId}]},(err,res)=>{
                                            // console.log(res);
                                    });
                                }
                            }
                        }
                    });
                    
                    io.emit("receiveMessage", data);
                    fn({message:"Message Send Successfully",status:200});
                    }
                });}
            else{
                fn({error:"Please provide the room ID",status:500});
            }
        }catch(err){
            fn({error:err,status:500});
        }
    });

    socket.on('seenAllMessages',async (data,fn) => {
        try{
            // console.log(data);
            await User.updateOne({ _id : data.userId},
                            {$set: { "rooms.$[elem].seen":true,"rooms.$[elem].unseenMessages":0}},
                            {arrayFilters: [{ "elem._id": data.roomId}]},
                            (err,res) => {
                                if(err){
                                    // console.log(err);
                                    fn({error:err,status:501});
                                }else{
                                    console.log(res);
                                    fn({message:"seenAllMessages Set Successfully",status:200});
                                }
            });
        }catch(err){
            console.log(err);
            fn({error:err,status:500});
        }
    });

    socket.on('delete_room',async (data,fn) => {
        try{
            // console.log(data);
            User.updateOne({ _id : data.userId},
                {$pull: {rooms:{_id:data.roomId}}},
                async (err,res) => {
                    if(err){
                        console.log(err);
                        fn({error:err,status:501});
                    }else{
                        // console.log(res);
                        const otherUser = await User.find({username:data.chatName});
                        let obj={
                            isOnline:otherUser[0].online,
                            name:otherUser[0].username,
                            _id:otherUser[0]._id,
                            emailId:otherUser[0].emailId,
                        }
                        fn({message:"Chat Deleted Successfully",status:200,obj:obj});
                    }
            });
        }catch(err){
            console.log(err);
            fn({error:err,status:500});
        }
    });

    socket.on('clear_messages',async (data,fn) => {
        try{
            // console.log(data);
            Room.updateMany({ _id : data.roomId},
                {$pull: {messages:{}}},async (err,res) => {
                    if(err){
                        console.log(err);
                        fn({error:err,status:501});
                    }else{
                        // console.log(res);
                        const message = {
                            body:"",
                            from:"",
                            time: new Date(),
                        }
                        await User.updateOne({ _id : data.userId},
                            {$set: { "rooms.$[elem].seen":true,"rooms.$[elem].unseenMessages":0,"rooms.$[elem].lastMessage":message}},
                            {arrayFilters: [{ "elem._id": data.roomId}]},(err,res)=>{
                                // console.log(res);
                        });
                        fn({message:"Messages Cleared Successfully",status:200});
                    }
            });
        }catch(err){
            console.log(err);
            fn({error:err,status:500});
        }
    });

    socket.on('all_users',async (userName,fn) => {
        try{
            const allUsers = await User.find({});
            var otherUsers = [];
            for(let i=0;i<allUsers.length;i++)
            {
                if(allUsers[i].username !== userName){
                    let name = allUsers[i].username;
                    otherUsers.push(name);
                }
            }
            fn({message:"Sending all users",status:200,otherUsers:otherUsers});
        }catch(err){
            console.log(err);
            fn({error:err,status:500});
        }
    });


    socket.on('disconnect',() => {
        console.log("UserLeft!!!");
    });
});

server.listen(port,()=>{
    console.log(`Listening at localhost:${port}`);
})
