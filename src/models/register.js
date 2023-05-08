const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt =require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true 
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true,
        unique:true     
    },
    age:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})
//generating token 
employeeSchema.methods.generateAuthToken = async function (){
    try{
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET-KEY);
        this.tokens =this.tokens.concat({token:token})
        await this.save();
        return token;
    }catch(error){
        res.send("the error part" + error);
    }
}
employeeSchema.pre("save", async function(next){
    if(this.isModified("password")){
       // const passwordHash = await bcrypt.hash(password,10);
        
        this.password = await bcrypt.hash(this.password,10);
        console.log(`the current password is ${this.password}`);
        this.confirmpassword = await bcrypt.hash(this.password,10);
    }
    next();
})

const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;