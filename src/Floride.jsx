import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './Floride.css';

const Floride = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsReplying(true);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3.1:free",
        "messages": newMessages,
        "stream": true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`Error: ${error.error.message}`);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: `Error: ${error.error.message}` }]);
      setIsReplying(false);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let botMessageContent = '';
    let botMessageIndex = -1;

    // Add a placeholder for the bot's message
    setMessages(prevMessages => {
      botMessageIndex = prevMessages.length;
      return [...prevMessages, { role: 'assistant', content: '' }];
    });

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsReplying(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                console.error(`Stream error: ${parsed.error.message}`);
                botMessageContent += `\n\nError: ${parsed.error.message}`;
                setMessages(prevMessages => {
                  const newMessages = [...prevMessages];
                  newMessages[botMessageIndex] = { role: 'assistant', content: botMessageContent };
                  return newMessages;
                });
                setIsReplying(false);
                return;
              }
              const content = parsed.choices[0].delta.content;
              if (content) {
                botMessageContent += content;
                setMessages(prevMessages => {
                  const newMessages = [...prevMessages];
                  newMessages[botMessageIndex] = { role: 'assistant', content: botMessageContent };
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } finally {
      reader.cancel();
      setIsReplying(false);
    }
  };

  return (
    <div className="floride-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content-wrapper"> {/* New wrapper div */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              {isReplying && msg.role === 'assistant' && index === messages.length - 1 && (
                <span className="typing-indicator"></span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={isReplying}
        />
        <button onClick={handleSend} disabled={isReplying}>Send</button>
      </div>
    </div>
  );
};

export default Floride;
