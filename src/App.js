import { useState, useRef } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import axios from 'axios';
import './App.css';
import ChatComponent from './components/ChatComponent'
import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [messages, setMessages] = useState([
    {
      message: "Hello! Upload a PDF and I'll help you analyze it.",
      sentTime: "just now",
      sender: "assistant"
    }
  ]);
  const [pdfUploadedId, setPdfUploadedId] = useState("")
  const [isTyping, setIsTyping] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const viewerRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append('pdf', file);
      try {
        const response = await axios.post(process.env.REACT_APP_API_BASE_URL + 'upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setPdfUploadedId(response.data.data.fileName)

        if (response.data.data.fileName) {
          console.log('PDF processed successfully');
        } else {
          throw new Error(response.data.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Error uploading PDF:', error);
        setMessages(prev => [...prev, {
          message: `Upload failed: ${error.message}`,
          sender: "assistant",
          direction: 'incoming',
          isError: true
        }]);
      }
    }
  };

  const handleSend = async (message) => {
    const newMessage = { message, sender: "user", direction: 'outgoing' };
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    try {
      const response = await axios.post(process.env.REACT_APP_API_BASE_URL + 'prompt', {
        fileName: pdfUploadedId,
        prompt: message
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setMessages(prev => [...prev, {
        message: response.data.data,
        sender: "assistant",
        direction: 'incoming',
        // citations: response.data.sources?.map(src => src.page) || []
      }]);
    } catch (error) {
      const errorDetails = error.response?.data?.error ||
        error.response?.data?.details ||
        error.message;
      setMessages(prev => [...prev, {
        message: `Error: ${errorDetails}`,
        sender: "assistant",
        direction: 'incoming',
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      <div className="pdf-viewer-container">
        {pdfFile ? (
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`}>            <Viewer
            fileUrl={pdfFile}
            plugins={[defaultLayoutPluginInstance]}
            ref={viewerRef}
          />
          </Worker>
        ) : (
          <div className="upload-container">
            <h2>Upload a PDF to get started</h2>
            <input type="file" accept=".pdf" onChange={handleFileChange} />
          </div>
        )}
      </div>
      <ChatComponent messages={messages} isTyping={isTyping} handleSend={handleSend} />
    </div>
  );
}

export default App;
