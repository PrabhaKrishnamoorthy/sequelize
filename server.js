import express from 'express';
import cors from 'cors';
import db from './models/index.js';
import employeeRoutes from './routes/employee.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

var corsOptions = {
    origin:`http://localhost:8081`
};

//middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//sync database
db.sequelize.sync()
.then(()=>{
    console.log('synced db');
})
.catch((err)=>{
    console.log("Failed to sync db:"+err.msg)
});

//Routes
employeeRoutes(app);
adminRoutes(app);

//default route
app.get('/',(req, res)=>{
    res.json({msg:'welcome to our website'});
});

const PORT = process.env.PORT || 8082;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});