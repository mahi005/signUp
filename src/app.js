require('dotenv').config();
const express = require("express");
const path =require("path");
const app = express();
const hbs = require("hbs");
require("./db/conn");
const Register=require("./models/register");
const bcrypt = require("bcryptjs");
const jwt =require("jsonwebtoken");
const cookieParser =require("cookieParser");
const auth = require("./middleware/auth");


const port = process.env.PORT || 3000;

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static(static_path));
app.set("view engine" , "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res)=>{
    res.render("index");
});

app.get("/secret",auth, (req, res)=>{
    res.render("secret");
});
app.get("/signup", (req, res)=>{
    res.render("signup");
});
app.get("/login", (req, res)=>{
    res.render("login");
});
app.post("/signup", async(req, res)=>{
    try{
        const password= req.body.password;
        const cpassword = req.body.confirmpassword;
 
        if(password===cpassword){
         const resgisterEmployee = new Register({
             firstname:req.body.firstname,
             lastname:req.body.lastname,
             email:req.body.email,
             gender:req.body.gender,
             password:req.body.password,
             confirmpassword:req.body.confirmpassword,          
         })

         const token = await resgisterEmployee.generateAuthToken();

         res.cookie("jwt", token, {
            expires:new Date(Date.now() + 90000),
            httpOnly:true
         });
         
          const registered = await resgisterEmployee.save();
          console.log("data" + registered);
          
          res.status(201).render("index");
        }else{
            res.send("invaild credentials")
        }
     }catch(error){
         res.status(400).send(error);      
     }
})


//for login

app.post("/login", async(req,res)=>{
    try{
        const email =req.body.email;
        const password = req.body.password;

       const useremail = await Register.findOne({email:email});

       const isMatch =  await bcrypt.compare(password,useremail.password);
       const token = await useremail.generateAuthToken();

       
       res.cookie("jwt", token, {
        expires:new Date(Date.now() + 90000),
        httpOnly:true
     });

       console.log("token" + token);
       if(isMatch){
        res.status(201).render("index");
       }else{
        res.send("invalid login Details");
       }
    }catch(error){
        res.status(400).send("invalid Email");
    }
})
app.listen(port, () =>{
    console.log(`server running at port no ${port}`);
})