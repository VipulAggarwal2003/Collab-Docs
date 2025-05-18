import Document from "../models/doc-model.js";

export const getDocument = async (id) =>{
    if(id === null || id === undefined) {console.log(id) ; return;}

    const document = await Document.findById(id);

    if(document) return document;

    return await Document.create({_id:id,data:""});
}

export const updateDocument = async (id,data) => {
    return await Document.findByIdAndUpdate(id,{data});
}