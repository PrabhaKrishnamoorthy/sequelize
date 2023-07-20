import {DataTypes, Sequelize} from 'sequelize';

export default (sequelize, Sequelize)=>{
    const Employee = sequelize.define('employee',{
        employee_id:{
            type:DataTypes.INTEGER,
            },
        name:{
            type:DataTypes.TEXT,
        },
        email:{
            type:DataTypes.STRING,
        },
        mobile_no:{
            type:DataTypes.BIGINT,
        },
    });
    return Employee;
};