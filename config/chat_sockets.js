
module.exports.chatSockets = function(socketServer){
let io = require('socket.io')(socketServer, {cors: {
    origin: "*", 
    methods: ["GET", "POST"]}});
    

io.sockets.on('connection',function(socket){
//    console.log('new connection received',socket.id);

    socket.on('disconnect',function(){
  //      console.log('socket disconnected.....');
    });

    socket.on('join_room',function(data){
    //    console.log('joinin request received...' ,data);
       //if chatroom with name data.chatroom exists user will enter into it , if it does;nt exist it will be created and user will enter to it
        socket.join(data.chatroom);
        io.in(data.chatroom).emit('user_joined',data);       
    });
    
    socket.on('send_message',function(data){
        io.in(data.chatroom).emit('receive_message',data);
    })

});
} 