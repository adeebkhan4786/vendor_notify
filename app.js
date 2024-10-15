import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';


//Importing Files
import { errorMiddleware } from "./middlewares/error.js";
import vendorRouter from "./routes/vendorRouter.js";


//setup
const app = express();
dotenv.config({ path: "./config/config.env" });


//Middlewares
app.use(cors(
  {
    origin: [process.env.FRONTENTD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
)
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use('/api/v1/vendors', vendorRouter);



// For Handling Errors 
app.use(errorMiddleware);

export default app;