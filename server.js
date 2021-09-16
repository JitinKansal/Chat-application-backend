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
    res.status(200).send("Hello");
});


app.use(require('./routes/auth'));
app.use(require('./routes/room'));
// app.use(require('./routes/messages'));
// app.use(require('./routes/user'));

//listener
const server = http.createServer(app);
const io = socketio(server);
server.listen(port,()=>{
    console.log(`Listening at localhost:${port}`);
})