import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async(req,res,next)=>{
    const {username, email, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({username, email, password: hashedPassword});
    try{
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        next(error);
  }
}

export const signin = async (req,res,next)=>{
    const {username, password} = req.body;
    try{
        const validUser = await User.findOne({username});
        if (!validUser) {
            return next(errorHandler(404, "User not found!"));
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);

        if (!validPassword) {
            return next(errorHandler(400, "Invalid credentials!"));
        }

        const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET);        //token for user authentication
        
        const {password: pass, ...rest} = validUser._doc;      //to avoid showing password in response

        res.cookie('access_token', token, {
            httpOnly: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }       //optional 
        ).status(200).json(rest);

    }catch(error){
        next(error);
    }
}