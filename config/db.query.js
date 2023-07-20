// import db from '../models/index.js';

// const addRefreshTokenColumn = async () =>{
//     try {
//         const alterTableQuery = ` 
//         ALTER TABLE admin
//         ADD COLUMN refresh_token VARCHAR(255);`;
//         await db.query(alterTableQuery);
//         console.log('Refresh token column added to the table')
//     } catch (error){
//         console.error('Error adding refresh token column', error);
//     } finally {
//         await db.end();
//     }
// };

// // call the function to add the column
// addRefreshTokenColumn();