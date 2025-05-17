import mongoose from "mongoose";

const Connection = async () =>{
    const URL = process.env.MONGO_URL;

    try{
       await mongoose.connect(URL,{
         useUnifiedTopology:true,
         useNewUrlParser:true
       });

       console.log("Database connected successfully");
    }
    catch(error){
        console.log("Error in mongodb connection\n",error);
    }
}

export default Connection;