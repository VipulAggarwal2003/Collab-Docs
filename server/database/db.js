import mongoose from "mongoose";

const Connection = async (username="vipulthebest123",password = "Saimagic123%40") =>{
    const URL = `mongodb+srv://${username}:${password}@google-doc-clone.d4fvx.mongodb.net/?retryWrites=true&w=majority&appName=Collab-doc`;

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