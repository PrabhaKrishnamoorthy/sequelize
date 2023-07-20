import db from "../models/index.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { Op } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

const Employee = db.employees;
const Admin = db.admins;
//const jwtSecret = "sample"
//const jwtRefreshSecrete = "welcome"

//create a new admin (register)
export const create = async (req, res) => {
    try {
        const { name, password, conformPassword, email } = req.body;
        const saltRounds = 10;

        //validate request
        if (!name || !password || !conformPassword || !email) {
            res.status(400).send({ msg: "Must fill all the input fields" })
            return;
        }
        //check the entered password
        if (password !== conformPassword) {
            res.status(401).send({ msg: "Password are not same.Please enter the same password" });
            return;
        }
        //hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        //create admin object
        const admin = {
            name,
            password: hashedPassword, // store hashed password in the "password" field
            email,
        }
        //save the data in database
        const data = await Admin.create(admin);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            msg: err.msg || "some err occured while creating admin",
        });
    }
};
/*
export const login = async (req, res)=>{
    try{
        const {email, password}= req.body;
        //validate request
        if(!email || !password){
            res.status(400).send({msg:"Email and password are required"});
            return;
        }
        //find admin by email
        const admin = await Admin.findOne({where:{email}});

        if(!admin){
            res.status(401).send({msg:"Admin not found"});
            return;
        }

        //compare passwords
        const passwordMatch = await bcrypt.compare(password, admin.password);

        if(!passwordMatch){
            res.status(401).send({msg:"invalid password"});
            return;
        }
        //generate jwt token
        const token = jwt.sign({email:admin.email},jwtSecret);

        res.status(200).json({token});
        }catch(err){
            res.status(500).send({
                msg:err.message || "some err occured while logging in",
            });
        }
};
*/

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        //validate request
        if (!email || !password) {
            res.status(400).send({ msg: "Email and password are required" });
            return;
        }
        //find admin by email
        const admin = await Admin.findOne({
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        })
        if (!admin) {
            res.status(401).send({ msg: "Admin not found" });
            return;
        }
        //compare passwords
        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            res.status(401).send({ msg: "invalid password" });
            return;
        }

        //generate jwt token
        const expiresIn = process.env.ACCESS_TOKEN_EXPIRATION || '60s';
        const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRATION || '1d';
        const accessToken = jwt.sign(
            { email: admin.email},
            process.env.Access_TOKEN_SECRET,
            { expiresIn}
            );
        const refreshToken =  jwt.sign(
            { email : admin.email},
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: refreshTokenExpiresIn}
        );

        //save the refresh token in the databasse
        admin.refresh_token = refreshToken;
        await admin.save();

        //Extract the base64 encoded payload
        const payloadBase = accessToken.split(".")[1];
        //decode the base64 and parse the json
        const payload = JSON.parse(atob(payloadBase));

        //Expiration time in UNIX timeStamp format
        const expirationTime = payload.exp;

        //convert the UNIX timestamp to js data object
        const expirationDate = new Date(expirationTime * 1000);

        // Get the expiration time in the current time format
        const expirationTimeFormatted = expirationDate.toLocaleString();

        res.cookie('jwt', refreshToken, {httpOnly:true, sameSite:'none', secure:true, maxAge: 60*1000});
        //res.json({accessToken, expiration: expirationTimeFormatted});
        res.cookie('jwt',accessToken,{httpOnly:true, sameSite:'none', secure:true, maxAge:30*1000})
        //res.json({accessToken});

        //pass the access token in the response headers
        res.setHeader('Authorization',`Bearer ${accessToken}`);

        //saving refreshToken with current user
        //refresh the access token if it has expired
        await verifyToken (refreshToken, admin,res);

        //redirect to the employee route or send a success message
        // res.json({'success': `user ${user} is logged in!`});
        res.redirect('/api/employees');
        //Retrive employee details from the database
        //const employees = await Employee.findAll();
        //res.status(200).json({token:accessToken, employees})
    } catch (err) {
        res.status(500).send({
            msg: err.msg || "some err occured while logging in",
        });
    }
};

export const logout = async (req, res)=>{
    try{
        //clear the refresh token in the daatbase
        const admin  = req.admin;
        admin.refresh_token = null;
        await admin.save();
        //clear the refresh token cookie
        res.clearCookie ('jwt', {httpOnly:true, sameSite:'none', secure:true});

        //send a success message or redirect to the login page
        res.status(200).send({msg:"logged out successfully"});
    }catch(error){
        res.ststus(500).send({
            msg:error.msg || "some error occured while logging out",
        });
    }
};

const refreshAccessToken = async (admim, res)=>{
    try {
        //generate a new access token
        const accessToken = jwt.sign (
            {email:admin.email},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '60s'}
        );
    
    //update the access token in the response headers
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    //update the access token cookie
    res.cookie ('jwt', accessToken, {httpOnly:true, sameSite:'none', secure:true, maxAge: 30*1000});
    return accessToken;
    } catch (error){
        throw new Error("Error refreshing access token");
    }
};

const verifyToken = async (token, admin) =>{
    try {
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        //check if the token has expired
        if (decodedToken.exp < Date.now()/1000){
            //Token has expired, refresh the access token 
            const accessToken = await refreshAccessToken (admin, res);
            return accessToken;
            //admin.refresh_token = null;
            //await admin.save();
        }
        return null;
    } catch (error){
        throw new error ('Error verifying token');
    }
};