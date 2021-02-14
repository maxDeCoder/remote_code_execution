const { response } = require("express");
const express = require("express");
const fs = require("fs");
const path = require("path");
const socketio = require("socket.io");
const http = require("http")

const app = express();
const router = express.Router();
const port = process.env.PORT || 80;
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1mb" }));
server.listen(port, () => {
  console.log("listening to port : ", port);
  console.log("server started");
});

var command_buffer = []
var api_key = process.env["KEY"] || 0;
var global_socket = null;
var new_command = false;

function startDesktopClient(socket){
    global_socket = socket
}

function clearCommandBuffer(){
    command_buffer = []
}

io.on('connect', socket => {
    socket.on('join', client => {
        console.log("new connection")
        if(client.key != api_key){socket.disconnect();}
        else{
            console.log("connected")
            socket.emit('general', {
                message: "connected to device"
            });
            startDesktopClient(socket);
        }
    });
    socket.on("new command", data => {
        if(data.key == api_key){
            console.log(data);
            new_command = true
            command_buffer.push(data.command);
        }else{
            socket.emit('general', {error: "invalid authentication"});
        }
    })
    socket.on('disconnect', () => {
        clearCommandBuffer();
    })
})

app.get("/client/command", (req,res) => {
    to_send = {
        command: command_buffer || ["NO"],
        kill: false,
        timeout: 3,
        sleep: 3,
        new_command: new_command
    };
    if (new_command){new_command=false}
    res.send(to_send)
});

app.post("/output/", (req,res) => {
    command = req.body.command;
    output = req.body.output;
    if (global_socket != null){
        global_socket.emit("output", {
            command:command,
            output:output
        });
    }
    res.send("ok")
});