import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';


export default function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          padding: '4px 8px',
          fontSize: 12,
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          zIndex: 1
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
     <SyntaxHighlighter
  language={language || null}
  style={prism}
  wrapLongLines={true}
  customStyle={{ paddingTop: 20 }}
>
  {value}
</SyntaxHighlighter>

    </div>
  );
}
