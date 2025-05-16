import React, { useEffect,useState } from "react";
import { Box } from "@mui/material";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import styled from "@emotion/styled";
import { io } from "socket.io-client"
import { useParams } from "react-router-dom";
const Component = styled.div`
  background: #f5f5f5;
`;

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  ["link", "image", "video", "formula"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
];

const Editor = () => {
  const {id} = useParams();
  const [socket,setSocket] = useState();
  const [quill,setQuill] = useState();

  useEffect(() => {
    const quillServer = new Quill("#container", { theme: "snow", modules: { toolbar: toolbarOptions } });
    quillServer.disable();
    quillServer.setText("Loading the document....");
    setQuill(quillServer);
  }, []);

  useEffect(() => {
    const socketServer = io("https://collab-docs-any8.onrender.com");
    setSocket(socketServer);

    return () => {
      socketServer.disconnect();
    }
  },[]);

  useEffect(()=>{
    if(socket === null || quill === null) return;
    const handleChange = (delta,oldData,source) =>{
       if(source !== "user") return;

       socket && socket.emit("send-changes",delta);
    }

    quill && quill.on("text-change",handleChange);

    return () =>{
      quill && quill.off("text-change",handleChange);
    }

  },[quill,socket]);

  useEffect(()=>{
    if(socket === null || quill === null) return;
    const handleChange = (delta) =>{
       quill.updateContents(delta);
    }

    socket && socket.on("receive-changes",handleChange);

    return () =>{
      socket && socket.off("receive-changes",handleChange);
    }

  },[quill,socket]);

  useEffect(()=>{
    if(quill === null || socket === null) return;
    
    socket && socket.once("load-document",document=>{
        quill && quill.setContents(document);
        quill && quill.enable();
    })

    socket && socket.emit("get-document",id);

  },[quill,socket,id]);

  useEffect(()=>{
    if(socket === null || quill === null) return;

    const interval = setInterval(()=>{
      socket && socket.emit("save-document",quill.getContents())
    },2000);

    return () => {
       clearInterval(interval);  
    }
  },[socket,quill]);

  return (
    <Component>
      <Box className="container" id="container" />
    </Component>
  );
};

export default Editor;
