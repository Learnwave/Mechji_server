import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./Routes/authRoute.js";
import userRouter from "./Routes/userRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./Routes/adminRoute.js";

const app = express();

const port = process.env.port || 4000;


connectDB();
connectCloudinary();

app.use(express.json());

app.use(cookieParser());

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"],credentials:true }));
// api endpoints

app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
app.use('/api/admin',adminRouter);


app.get("/",(req,res)=>{
        res.send("Api is working fine");
})

app.listen(port,()=>{
    console.log(`server started at Port : ${port}`)
});