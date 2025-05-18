import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config()
const Connection = async () =>{
    const URL = process.env.MONGO_URL;

    try{
       await mongoose.connect(URL,{
         dbName:'google-doc-clone'
       });

       console.log("Database connected successfully");
    }
    catch(error){
        console.log("Error in mongodb connection\n",error);
    }
}

export default Connection;