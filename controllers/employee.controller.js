/*
import db from "../models/index.js";


const Employee = db.employees;

//create a new employee
export const create = async (req, res) => {
    try {
        const { employee_id, name, email, mobile_no } = req.body

        //validate request
        if (!employee_id || !name || !email || !mobile_no) {
            res.status(400).send({ msg: "Must fill all the input field " })
            return;
        }
        //create employee object
        const employee = {
            employee_id,
            name,
            email,
            mobile_no,
        }
        //save the data in database
        const data = await Employee.create(employee);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            msg:
                err.msg || "some err occured while creating employee",
        });
    }
};

//get all employee

export const findAll = async (req, res) => {
    try {
        const data = await Employee.findAll();
        res.send(data);
    } catch (err) {
        res.status(500).send({
            msg: err.msg || "some err occured while retriving employee details",
        });
    }
};

//Find employee by id
export const findByPk = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Employee.findByPk(id);
        if (!data) {
            res.status(404).send({ msg: `Employee with id ${id} not found` });
        } else {
            res.send(data);
        }
    } catch (err) {
        res.status(500).send({
            msg:
                err.msg || `some err occured while retriving employee details with id ${id}`,
        });
    }
};

//update a tutorial by id
export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const { employee_id, name, email, mobile_no } = req.body;

        const num = await Employee.update(
            { employee_id, name, email, mobile_no },
            { where: { id } }
        );
        if (num[0] === 1) {
            res.send({ msg: "Employee details was updated successfully" });
        } else {
            res.send({
                msg: `cannot update employee with id ${id}.Maybe employee was not found or req.body is empty.`,
            });
        }
    } catch (err) {
        res.status(500).send({
            msg: err.msg || `Error updating employee with id ${id}`,
        })
    }
};

//remove a employee by id
export const deleteEmployee = async (req, res) => {
    try {
        const id = req.params.id;

        const num = await Employee.destroy({ where: { id: id } });
        if (num === 1) {
            res.send({ msg: `Employee was deleted successfully.` });
        } else {
            res.send({
                msg: `cannot delete Employee with id${id}.MAybe Employee was not found`,
            })
        }
    } catch (err) {
        res.status(500).send({
            msg: err.msg || `could not delete Employee with id ${id}`,
        })
    }
};
*/

import db from "../models/index.js";
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import dotenv from 'dotenv'
dotenv.config();

const Employee = db.employees;
const jwtSecret = process.env.ACCESS_TOKEN_SECRET;
const jwtRefreshSecret = process.env.REFRESH_TOKEN_SECRET;
//const jwtSecret = "sample";
//const jwtRefreshSecret = "your-refresh-secret-key";

// Create a new employee
export const create = async (req, res) => {
  try {
    // Extract the access token from the request headers
    const accessToken = req.headers.authorization.split(' ')[1];

    // Verify the access token
    const decoded = await promisify(jwt.verify)(accessToken, jwtSecret);
    const email = decoded.email;

    // Retrieve the employee details from the request body
    const { employee_id, name, email: empEmail, mobile_no } = req.body;

    // Validate request
    if (!employee_id || !name || !empEmail || !mobile_no) {
      res.status(400).send({ msg: "Must fill all the input fields" });
      return;
    }

    // Verify the email in the access token matches the email in the request body
    // if (email !== empEmail) {
    //   res.status(401).send({ msg: "Unauthorized" });
    //   return;
    // }

    // Create employee object
    const employee = {
      employee_id,
      name,
      email: empEmail,
      mobile_no,
    };

    // Save the data in the database
    const data = await Employee.create(employee);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      msg: err.msg || "Some error occurred while creating an employee",
    });
  }
};

// Get all employees
export const findAll = async (req, res) => {
    try {
      // Extract the access token from the request headers
      const accessToken = req.headers.authorization.split(' ')[1];
  
      // Verify the access token
      jwt.verify(accessToken, jwtSecret, (err, decoded) => {
        if (err) {
          res.status(401).send({ msg: "Unauthorized" });
          return;
        }
  
        // Retrieve all employee details from the database
        Employee.findAll().then((data) => {
          res.send(data);
        });
      });
    } catch (err) {
      res.status(500).send({
        msg: err.msg || "Some error occurred while retrieving employee details",
      });
    }
  };
// Find employee by id
export const findByPk = async (req, res) => {
  try {
    const id = req.params.id;
    // Retrieve the access token from the request headers
    const accessToken = req.headers.authorization.split(' ')[1];

    // Verify the access token
    jwt.verify(accessToken, jwtSecret, (err, decoded) => {
      if (err) {
        res.status(401).send({ msg: "Unauthorized" });
        return;
      }

      // Find employee by id
      Employee.findByPk(id).then((data) => {
        if (!data) {
          res.status(404).send({ msg: `Employee with id ${id} not found` });
        } else {
          res.send(data);
        }
      });
    });
  } catch (err) {
    res.status(500).send({
      msg: err.msg || `Some error occurred while retrieving employee details with id ${id}`,
    });
  }
};

// Update an employee by id
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const { employee_id, name, email: empEmail, mobile_no } = req.body;

    // Validate request
    if (!employee_id || !name || !empEmail || !mobile_no) {
      res.status(400).send({ msg: "Must fill all the input fields" });
      return;
    }

    // Extract the access token from the request headers
    const accessToken = req.headers.authorization.split(' ')[1];

    // Verify the access token
    jwt.verify(accessToken, jwtSecret, (err, decoded) => {
      if (err) {
        res.status(401).send({ msg: "Unauthorized" });
        return;
      }

      // Verify the email in the access token matches the email in the request body
      // if (decoded.email !== empEmail) {
      //   res.status(401).send({ msg: "Unauthorized" });
      //   return;
      // }

      // Update the employee details in the database
      Employee.update(
        { employee_id, name, email: empEmail, mobile_no },
        { where: { id } }
      ).then((num) => {
        if (num[0] === 1) {
          res.send({ msg: "Employee details were updated successfully" });
        } else {
          res.send({
            msg: `Cannot update employee with id ${id}. Maybe employee was not found or req.body is empty.`,
          });
        }
      });
    });
  } catch (err) {
    res.status(500).send({
      msg: err.msg || `Error updating employee with id ${id}`,
    });
  }
};

// Remove an employee by id
export const deleteEmployee = async (req, res) => {
  try {
    const id = req.params.id;

    // Extract the access token from the request headers
    const accessToken = req.headers.authorization.split(' ')[1];

    // Verify the access token
    jwt.verify(accessToken, jwtSecret, (err, decoded) => {
      if (err) {
        res.status(401).send({ msg: "Unauthorized" });
        return;
      }

      // Delete the employee from the database
      Employee.destroy({ where: { id: id } }).then((num) => {
        if (num === 1) {
          res.send({ msg: `Employee was deleted successfully.` });
        } else {
          res.send({
            msg: `Cannot delete employee with id ${id}. Maybe employee was not found`,
          });
        }
      });
    });
  } catch (err) {
    res.status(500).send({
      msg: err.msg || `Could not delete employee with id ${id}`,
    });
  }
};

