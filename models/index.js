import { Sequelize } from "sequelize";
import dbConfig from "../config/db.config.js";
import employeeModel from "./employee.model.js";
import adminModel from "./admin.model.js";



const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    operatorAliases: false,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//to create the table in database
db.employees = employeeModel(sequelize, Sequelize);
db.admins = adminModel(sequelize, Sequelize);

// Synchronize models with the database
// db.sequelize.sync({ force: true })
// .then(() => {
//   console.log("Drop and re-sync db.");
//   addRefreshTokenColumn(); // Call the function after the synchronization
// })
// .catch((err) => {
//   console.log("Failed to drop and re-sync db:", err);
// });

// const addRefreshTokenColumn = async () => {
// try {
//   const alterTableQuery = `
//     ALTER TABLE admins
//     ADD COLUMN refresh_token VARCHAR(255);
//   `;
//   await db.sequelize.query(alterTableQuery);
//   console.log('Refresh token column added to the table');
// } catch (error) {
//   console.error('Error adding refresh token column:', error);
// }
// };

  

//Drop and re-sync the database for creating database
// db.sequelize.sync({ force:true})
//  .then(()=>{
//     console.log("Drop and re-sync db.");
//  })
//  .catch((err)=>{
//      console.log("failed to drop and re-syncc db"+err.msg)
//  })
export default db;