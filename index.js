const express = require('express');
const env = require('./config/enviroment');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const connectDB=require('./config/mongoose');
//used for session 
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportJWT = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-oauth2-strategy');

const MongoStore = require('connect-mongo');
const sassMiddleware = require('node-sass-middleware');
const flash = require('connect-flash');
const customMware = require('./config/middleware');



//set up the chat server to be used with socket.io
const chatServer = require('http').Server(app);
const chatSockets =require('./config/chat_sockets').chatSockets(chatServer);
chatServer.listen(5000);
console.log('chat server is listenning on port 5000');
const path = require('path');


app.use(sassMiddleware({
    src:path.join(__dirname,env.asset_path,'/scss'),
    dest:path.join(__dirname,env.asset_path,'/scss'),
    debug:true,
    outputStyle:'extended',
    prefix:'/css'
}));

app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(env.asset_path));
//make the uploads path avilable to the browser, its making codeial+uploads
app.use('/uploads',express.static(__dirname+'/uploads'));

app.use(expressLayouts);
//extract style and scripts from sub pages into layout
app.set('layout extractStyles',true);

app.set('layout extractScripts',true);


//set up the view enginr
 app.set('view engine','ejs');
 app.set('views','./views');
//mongo store is used to store session cookie in db
//using session
app.use(session({
    name:'codeial',
    //todo : cahnge the secret before deploying
    secret: env.session_cookie_key,
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:(1000*60*100)
    },
    store: MongoStore.create(
        {
            mongoUrl:`mongodb://localhost:27017/${env.db}`,
            autoRemove: 'disabled'
        },
        function(err){
            console.log(err || 'connect-mongo-db-setup ok');
        }
    )
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.setFlash);

//use express router
app.use('/',require('./routes/index'));




 const start = async() =>{
    try {
        const url = 'mongodb://localhost:27017/codeial_development';
        await connectDB(url);
        app.listen(port,function(){
            console.log(`Server running at port: ${port}`);
        });

    } catch (error) {
        console.log(error);
    }
}
start();




// app.listen(port,function(err){
// if(err){
//     //console.log("Error",err);
//     console.log(`Error in server: ${err}`);
// }
// console.log(`Server running at port: ${port}`);
// });