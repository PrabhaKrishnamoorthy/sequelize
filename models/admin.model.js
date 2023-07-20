import {DataTypes, Sequelize} from 'sequelize';

export default (sequelize, Sequelize)=>{
    const Admin = sequelize.define('admin',{
        name:{
            type:DataTypes.TEXT,
        },
        password:{
            type:DataTypes.STRING,
        },
        email:{
            type:DataTypes.STRING,
        },
        refresh_token:{
            type:DataTypes.STRING,
            allowNull : true,
        },
    })
    return Admin;
}