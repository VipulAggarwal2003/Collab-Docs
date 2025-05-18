// import { useEffect, useState } from 'react';

// import Quill from 'quill';
// import 'quill/dist/quill.snow.css';

// import { Box } from '@mui/material';
// import styled from '@emotion/styled';

// import { io } from 'socket.io-client';
// import { useParams } from 'react-router-dom';

// const Component = styled.div`
//     background: #F5F5F5;
// `

// const toolbarOptions = [
//     ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
//     ['blockquote', 'code-block'],
  
//     [{ 'header': 1 }, { 'header': 2 }],               // custom button values
//     [{ 'list': 'ordered'}, { 'list': 'bullet' }],
//     [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
//     [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
//     [{ 'direction': 'rtl' }],                         // text direction
  
//     [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
//     [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
//     [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
//     [{ 'font': [] }],
//     [{ 'align': [] }],
  
//     ['clean']                                         // remove formatting button
// ];
  

// const Editor = () => {
//     const [socket, setSocket] = useState();
//     const [quill, setQuill] = useState();
//     const { id } = useParams();

//     useEffect(() => {
//         const quillServer = new Quill('#container', { theme: 'snow', modules: { toolbar: toolbarOptions }});
//         quillServer.disable();
//         quillServer.setText('Loading the document...')
//         setQuill(quillServer);
//     }, []);

//     useEffect(() => {
//         const socketServer = io('https://collab-docs-akrb.onrender.com',{transports:["websocket"]});
//         setSocket(socketServer);

//         return () => {
//             socketServer.disconnect();
//         }
//     }, [])

//     useEffect(() => {
//         if (socket === null || quill === null) return;

//         const handleChange = (delta, oldData, source) => {
//             if (source !== 'user') return;

//             socket.emit('send-changes', delta);
//         }

//         quill && quill.on('text-change', handleChange);

//         return () => {
//             quill && quill.off('text-change', handleChange);
//         }
//     }, [quill, socket])

//     useEffect(() => {
//         if (socket === null || quill === null) return;

//         const handleChange = (delta) => {
//             quill.updateContents(delta);
//         }

//         socket && socket.on('receive-changes', handleChange);

//         return () => {
//             socket && socket.off('receive-changes', handleChange);
//         }
//     }, [quill, socket]);

//     useEffect(() => {
//     if (quill === null || socket === null || !id) return;

//         socket && socket.once('load-document', document => {
//             quill.setContents(document);
//             quill.enable();
//         })

//         socket && socket.emit('get-document', id);
//     },  [quill, socket, id]);

//     useEffect(() => {
//         if (socket === null || quill === null) return;

//         const interval = setInterval(() => {
//             socket.emit('save-document', quill.getContents())
//         }, 2000);

//         return () => {
//             clearInterval(interval);
//         }
//     }, [socket, quill]);

//     return (
//         <Component>
//             <Box className='container' id='container'></Box>
//         </Component>
//     )
// }

// export default Editor;


import { useEffect, useState, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import { Box } from '@mui/material';
import styled from '@emotion/styled';

import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const Component = styled.div`
  background: #F5F5F5;
  height: 100vh;
`;

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ['clean'],
];

const Editor = () => {
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const wrapperRef = useRef(null);
  const { id } = useParams();

  // Set up Quill after component is mounted
  useEffect(() => {
    const wrapper = wrapperRef.current;
    wrapper.innerHTML = '';
    const editor = document.createElement('div');
    wrapper.append(editor);

    const quillInstance = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: toolbarOptions },
    });

    quillInstance.disable();
    quillInstance.setText('Loading the document...');
    setQuill(quillInstance);
  }, []);

  // Setup socket connection
  useEffect(() => {
    const socketInstance = io('/', {
      transports: ['websocket']
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Get document from backend on initial load or refresh
  useEffect(() => {
    if (socket === null || quill === null || !id) return;

    console.log('📤 Emitting get-document:', id);
    socket.once('load-document', (document) => {
      console.log('📥 Received load-document:', document);
      quill.setContents(document);
      quill.enable();
    });

    socket.emit('get-document', id);
  }, [socket, quill, id]);

  // Send changes to other clients
  useEffect(() => {
    if (socket === null || quill === null) return;

    const handleChange = (delta, oldData, source) => {
      if (source !== 'user') return;
      socket.emit('send-changes', delta);
    };

    quill.on('text-change', handleChange);

    return () => {
      quill.off('text-change', handleChange);
    };
  }, [socket, quill]);

  // Receive changes from other clients
  useEffect(() => {
    if (socket === null || quill === null) return;

    const handleChange = (delta) => {
      quill.updateContents(delta);
    };

    socket.on('receive-changes', handleChange);

    return () => {
      socket.off('receive-changes', handleChange);
    };
  }, [socket, quill]);

  // Auto-save document every 2 seconds
  useEffect(() => {
    if (socket === null || quill === null) return;

    const interval = setInterval(() => {
      socket.emit('save-document', quill.getContents());
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  return (
    <Component>
      <Box ref={wrapperRef} className='container'></Box>
    </Component>
  );
};

export default Editor;
