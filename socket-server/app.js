const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server);

//storing data
var connections = [];
var title = "Poll Name from Server" // admin can set this


io.on("connection", socket => {
    socket.once('disconnect', function(){
        connections.splice(connections.indexOf(socket), 1);
        socket.disconnect();
        console.log('Disconnect : %s sockets remainings' , connections.length)
    });

    socket.on('join', function(dataFromClient){
      var newMember = {
        id: this.id,
        name:dataFromClient.name

      };
      this.emit('joined', newMember) //sending this obj to client
      console.log( " %s joined the poll", dataFromClient.name);
    });
    socket.emit('welcome', {
        title:title
    });
    connections.push(socket)

    console.log("Connected : %s sockets connected", connections.length);

    // console.log(socket.id), setInterval(
    //     () => getApiAndEmit(socket),
    //     1
    // );

  socket.on("disconnect", () => console.log("Client disconnected"));
});
const getApiAndEmit = async socket => {
  try {
    const res = await axios.get(
      "https://pokeapi.co/api/v2/pokemon/"
    );
    socket.emit("FromAPI", res.data.results[0].name);
  } catch (error) {
    console.error(`Error: ${error.code}`);
  }
};
server.listen(port, () => console.log(`Listening on port ${port}`));