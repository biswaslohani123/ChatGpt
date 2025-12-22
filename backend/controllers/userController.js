import User from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";



//Generate JWT
const generateToken = (id) => {

    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })

}

// Api to register User
const registerUser = async (req, res) => {

    const {name, email, password} = req.body;
    try {
        if (!name || !email || !password) {

            return res.json({success: false, message: 'All fields are required'})
            
        }
        const userExists = await User.findOne({email})

        if (userExists) {

            return res.json({success: false, message: "user already exists."})
            
        }

        const user = await User.create({name, email, password})

        const token = generateToken(user._id)

        res.json({success: true, token})

    } catch (error) {

        return res.json({success: false, message: error.message})
    }

}

// API to login
const LoginUser = async (req, res) => {

    const {email, password} = req.body;

    try {
        if (!email || !password) {

            return res.json({success: false , message: 'All fields are required'})
            
        }
        const user = await User.findOne({email})
        if (user) {

            const isMatch = await bcrypt.compare(password, user.password)

            if (isMatch) {

                const token = generateToken(user._id);

                return res.json({success: true, token})
                
            }
            
        }

        return res.json({success: false, message: 'Invalid email or password'})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }

}

//Api to get user data
const getUser = async (req, res) => {
    try {
        const user = req.user;
        return res.json({success: true, user})

    } catch (error) {
        return res.json({success: false, message: error.message})
    }
}


export {registerUser, LoginUser, getUser}