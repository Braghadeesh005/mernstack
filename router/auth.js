const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router();
const bcrypt = require('bcryptjs')
const authenticate = require("../middleware/authenticate")
const cookieParser = require("cookie-parser");
router.use(cookieParser());
const User = require('../model/userSchema');
require('../db/conn');
//error 400-499 client errors
//error 500-599 Server errors




//REGISTRATION ROUTE using promises...
/*
router.post('/register', (req,res)=>{
 
    const { name, email, phone, work, password, cpassword} = req.body;
   
    if(!name || !email || !phone || !work || !password || !cpassword)
    {
        return res.status(422).json({error: "please fill the field properly"});
    }

    User.findOne({ email: email })
        .then((userExist)=>{
            if(userExist){
                return res.status(422).json({ error: "Email already exists"});
            }

            const user = new User({ name, email, phone, work, password, cpassword}); //if both key and value are same need not write both i.e name:name insted we can write just name...
               user.save().then(()=>{
               res.status(201).json({ message: "user registered successfully"});
            }).catch((err)=> res.status(500).json({error: "failed to register"}));

        }).catch(err => { console.log(err); });
  
});
*/



// REGISTRATION ROUTE using async await method
router.post('/register', async(req,res)=>{
 
    const { name, email, phone, work, password, cpassword} = req.body;
   
    if(!name || !email || !phone || !work || !password || !cpassword)
    {
        console.log("please fill the field properly");
        return res.status(422).json({error: "please fill the field properly"});
    }
    if(password != cpassword)
    {
        console.log("please confirm the same password");
        return res.status(422).json({error: "please confirm the same password"});
    }

    try{ 

        const userExist = await User.findOne({ email: email });
      
        if(userExist){
            console.log("Email already exists");
        return res.status(422).json({ error: "Email already exists"});
        }

        const user = new User({ name, email, phone, work, password, cpassword}); 

       const userRegister = await user.save();

        if(userRegister){
            console.log(user);
            console.log("user registered successfully");
            res.status(201).json({ message: "user registered successfully"});
        }
        else{
            console.log("failed to register");
            res.status(500).json({error: "failed to register"});
        }
    

    }
    catch(err){
        console.log(err);
    }
 
});




//LOGIN ROUTE
router.post('/signin', async (req,res)=>{
   try
   {
       let token;
       const { email, password}=req.body;

       if(!email || !password){
        console.log("Please fill the data");
        return res.status(400).json({errror:"Please fill the data"})
       }

       const userLogin = await User.findOne({email:email}); 
      
       if(userLogin)
       {
          const isMatch = await bcrypt.compare(password, userLogin.password);
          token = await userLogin.generateAuthToken();
          res.cookie("jwtoken",token,{
            expires:new Date(Date.now()+ 25892000),
            httpOnly:true
          });
          if(!isMatch)
          {
            console.log("Invalid Credentials");
            return res.status(400).json({error:"Invalid Credentials"});
          }
          else
          {
            console.log("User SignIn Successful");
          res.json({message:"User SignIn Successful"});
          }
       }
       else
       {
        console.log("Email you have entered has not registered or incorrect");
        return res.status(400).json({error:"Email you have entered has not registered or incorrect"});
       }
    }  
    catch(err)
    {
       console.log(err);
    }
})

//For Getting User Data in About and Contact Page
router.get("/getData",authenticate, (req,res) => 
{
    res.send(req.rootUser);
});



//Storing the Data Given in Contact Form in the DB
router.post('/contact',authenticate, async (req,res)=>{
    try{
        const {name,email,phone,message}= req.body;
        if(!name || !email || !phone || !message){
            console.log("Please Fill the Contact Form Completely");
            return res.json({error: "Please Fill the Contact Form"})
        }
        const userContact = await User.findOne({_id: req.userID});

        if(userContact){
            const userMessage = await userContact.addMessage(name,email,phone,message);
            await userContact.save();
            res.status(201).json({message:"Successfully sent message"});
        }

    }catch(error){
        console.log(error);
    }

})

//Logout page
router.get("/logout", (req,res) => 
{
    console.log("User Logged Out");
    res.clearCookie('jwtoken', {path: '/'});
    res.status(200).send("User Logout");
});




module.exports= router;

