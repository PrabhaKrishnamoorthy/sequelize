import db from "../models/index.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { Op } from "sequelize";
import dotenv from 'dotenv';
dotenv.config();

const Employee = db.employees;
const Admin = db.admins;

// Create a new admin (register)
export const create = async (req, res) => {
  try {
    const { name, password, confirmPassword, email } = req.body;
    const saltRounds = 10;

    // Validate request
    if (!name || !password || !confirmPassword || !email) {
      res.status(400).send({ msg: "Must fill all the input fields" });
      return;
    }

    // Check the entered password
    if (password !== confirmPassword) {
      res.status(401).send({ msg: "Passwords do not match. Please enter the same password" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin object
    const admin = {
      name,
      password: hashedPassword,
      email,
    };

    // Save the data in the database
    const data = await Admin.create(admin);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      msg: err.msg || "Some error occurred while creating an admin",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request
    if (!email || !password) {
      res.status(400).send({ msg: "Email and password are required" });
      return;
    }

    // Find admin by email
    const admin = await Admin.findOne({
      where: {
        email: {
          [Op.eq]: email,
        },
      },
    });

    if (!admin) {
      res.status(401).send({ msg: "Admin not found" });
      return;
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      res.status(401).send({ msg: "Invalid password" });
      return;
    }

    // Generate access token and refresh token
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Save the refresh token in the database
    admin.refresh_token = refreshToken;
    await admin.save();

    // Set cookies with refresh token and access token
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'none', secure: true });
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'none', secure: true });
    res.setHeader('Authorization',`Bearer ${accessToken}`);
    
    // Redirect or send a success message
    //res.redirect('/api/employees');
    res.json("logged in successfully");
  } catch (err) {
    res.status(500).send({
      msg: err.msg || "Some error occurred while logging in",
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear the refresh token in the database
    const admin = req.admin;
    admin.refresh_token = null;
    await admin.save();

    // Clear the refresh token and access token cookies
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: true });
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'none', secure: true });

    // Send a success message or redirect to the login page
    res.status(200).send({ msg: "Logged out successfully" });
  } catch (error) {
    res.status(500).send({
      msg: error.msg || "Some error occurred while logging out",
    });
  }
};

// Middleware to verify access token
export const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).send({ msg: "No access token provided" });
    }

    // Verify and decode the access token
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
      if (err) {
        return res.status(401).send({ msg: "Invalid token" });
      }

      // Set the admin data in the request for further use
      req.admin = decodedToken;

      next();
    });
  } catch (error) {
    return res.status(401).send({ msg: "Invalid token" });
  }
};


// Generate access token
const generateAccessToken = (admin) => {
  return jwt.sign({ email: admin.email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '60s',
  });
};

// Generate refresh token
const generateRefreshToken = (admin) => {
  return jwt.sign({ email: admin.email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '1d',
  });
};

export default {
  create,
  login,
  logout,
  authMiddleware,
};
