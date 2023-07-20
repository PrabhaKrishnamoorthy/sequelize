import { Router } from "express";
//import * as admins from "../controllers/admin.controller.js";
import * as admins from '../controllers/adminController.js';
import { authMiddleware } from "../controllers/adminController.js";

const router = Router();

//create new register
router.post('/register',admins.create);

//login user
router.post('/login',authMiddleware,admins.login);

export default (app)=>{
    app.use('/admin', router);
};

