import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock'; // Custom component for syntax highlighting + copy

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState("provider-6/o3-medium");
  const [imageBase64, setImageBase64] = useState(null);

  const A4F_API_KEY = process.env.REACT_APP_A4F_API_KEY;
  const A4F_BASE_URL = process.env.REACT_APP_A4F_BASE_URL;

  const models = [
    { name: "O3-Medium (Vision)", value: "provider-6/o3-medium" },
    { name: "GPT-4.1-mini", value: "provider-5/gpt-4.1-mini" },
    { name: "GPT-4.1", value: "provider-6/gpt-4.1" },
    { name: "Gemini", value: "provider-5/gemini-1.5-pro-latest" }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!input.trim() && !imageBase64) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    const isVisionModel = model === "provider-6/o3-medium";

    const message = isVisionModel
      ? {
          role: "user",
          content: [
            ...(input.trim() ? [{ type: "text", text: input }] : []),
            ...(imageBase64
              ? [
                  {
                    type: "image_url",
                    image_url: {
                      url: imageBase64
                    }
                  }
                ]
              : [])
          ]
        }
      : {
          role: "user",
          content: input.trim()
        };

    try {
      const response = await axios.post(
        `${A4F_BASE_URL}/chat/completions`,
        {
          model,
          messages: [message]
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${A4F_API_KEY}`
          }
        }
      );

      const reply = response.data.choices[0].message.content;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      setImageBase64(null);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: "Error: Unable to fetch reply." }
      ]);
    }
  };

  return (
    <div className="app">
      <h1>A4F GPT Chat</h1>

      <div className="model-select">
        <label>Select Model:</label>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          {models.map((m) => (
            <option key={m.value} value={m.value}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <strong>{msg.role === 'user' ? 'You' : 'GPT'}:</strong>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <CodeBlock language={match?.[1]} value={String(children).trim()} />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      {imageBase64 && (
        <div style={{ margin: "10px 0" }}>
          <strong>Image Preview:</strong><br />
          <img
            src={imageBase64}
            alt="preview"
            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
          />
        </div>
      )}

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
