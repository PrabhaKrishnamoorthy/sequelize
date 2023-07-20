import jwt from 'jsonwebtoken';
//import { promisify } from 'util';
import dotenv from 'dotenv'

dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // extract token from Authorization header

    if (!token) {
      return res.status(401).send({ msg: "No token provided" });
    }

    // Verify and decode the token
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    //store the decodeed token in the request object
    req.tokenPayload = decodedToken;

    // Check if the admin has a valid refresh token
    if (!req.admin || !req.admin.refresh_token) {
      return res.status(401).send({ msg: "Invalid or expired refresh token" });
    }

    // Move to the next middleware
    next();
  } catch (error) {
    // Token is invalid or expired, send unauthorized status
    return res.status(401).send({ msg: "Invalid token" });
  }
};

export default authMiddleware;
