import { Router } from "express";
import * as employees from '../controllers/employee.controller.js';
//import authMiddleware from "../middleware/authMiddleware.js";
import { authMiddleware } from "../controllers/adminController.js";

const router = Router();

//create a new employee
router.post('/create', authMiddleware,employees.create);

//retrive all employee details
router.get('/',authMiddleware,employees.findAll);

//retrive a single employee detail with id
router.get('/:id',authMiddleware, employees.findByPk);

//update a tutorial with id
router.put('/:id',authMiddleware,employees.update);

//delete a employee details with id
router.delete('/:id',authMiddleware,employees.deleteEmployee);

export default (app)=>{
    app.use('/api/employees', router);
};