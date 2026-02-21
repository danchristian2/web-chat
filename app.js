const express = require("express");//express
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");//mongodb
require("dotenv").config();//environment variables module
const app = express();//making app the instance of express
const path = require("path");//setting paths to send other filess to the server directly
app.use(express.json());//a middleware that accepts json data
const http = require("http"); //nodejs module to create an http serevr
const WebSocket = require("ws"); //imports websocket libary
const server = http.createServer(app); //connecting our express app to the http server
const wss = new WebSocket.Server({ server }); //creating a new websockets connection
mongoose//mongoose connection
  .connect(process.env.MONGODB_URI)//connecting to mongodb
  .then(() => {
    console.log("Database well connected");//it things go well
  })
  .catch((error) => {
    console.error(error.message);//if things go wrong
  });
const userSchema = new mongoose.Schema({//defining mongodb schema
  name: {
    type: String,
    required: true,
    minlength: 2,
  },
  message: {
    type: String,
    required: true,
    maxlength: 200,
  },
});
const userModel = new mongoose.model("user", userSchema, "accounts");//mongodb model
app.post("/",async(req, res) => {//setting up the environment to get the data
  try {
    const { name, message } = req.body;
    const data = new userModel({
      name,
      message,
    });//it things go well 
    await data.save();//data saved
    res.status(200).send("things went ok!!");
    console.log(data);
  } catch (error) {
    res.status(404).send("Page not found");
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
wss.on("connection", (ws) => {
  console.log("New client added to the connection");
  ws.on("message", (message) => {
    console.log(`msg received:${message}`);//To display the messages written by the client on the cli(terminal)

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());//wait untill the client has the platform open
      }
    });
  });
  ws.on("close", () => {
    console.log("client disconnected");//to show up when a client or the user disconnects
  });
  server.on('error', (err) =>{
    if(err.code === "ECONNRESET"){//to ignore the connection reset error
        return;
    }
    console.error(err.message);
  })
});
server.on("error", (error) => {
  console.log(error.message);//to get the errors in the node js server
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exeption:", err.message);//general error handling
});
process.on("unhandledRejection:", (err) => {
  console.error("UnhandledRejection", err);//general error handling
});
server.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);//here you use server no app coz the http server is the one which is connecting
});
