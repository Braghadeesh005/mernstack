const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv')
const app = express();
dotenv.config({path: './config.env' });
const port= process.env.PORT || 4000;

require('./db/conn');
//const User = require('./model/userSchema');


app.use(express.json());//a middleware
app.use(require('./router/auth'));// a middleware

/*
app.get("/",(req,res) => {
    res.send("hi");
});

app.get("/signin",(req,res) => {
    res.send("hi");
});

if(process.env.NODE_ENV == "production"){
    app.use(express.static("client/build"));
}
app.use(express.static(path.join(__dirname, "./client/build")));
*/
app.use(express.static("client/build"));
app.get("*",function(req,res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
})

app.listen(port,() =>{
    console.log("Server started");
});

