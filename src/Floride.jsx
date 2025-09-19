import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Floride.css';

async function checkCreditsStatus(apiKey) {
  // screw this, ill just check if it says: Error: Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/key', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    if (!response.ok) {
      return { hasCredits: false, remaining: 0, message: 'Failed to verify key' };
    }
    const data = await response.json();
    
    if (data.data.is_free_tier && data.data.limit && data.data.usage >= data.data.limit) {
      return {
        hasCredits: false,
        remaining: 0,
        message: 'Free tier credits exhausted'
      };
    }

    return {
      hasCredits: true,
      remaining: data.data.limit ? data.data.limit - data.data.usage : null,
      message: 'Credits available'
    };

  } catch (error) {
    console.error('Failed to check credits status:', error);
    return {
      hasCredits: false,
      remaining: 0,
      message: 'Failed to check credits status'
    };
  }
}

const Floride = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [usage, setUsage] = useState(null);
  const [currentApiKey, setCurrentApiKey] = useState(null);
  const apiKeys = (import.meta.env.VITE_OPENROUTER_API_KEY || '').split(',').map(key => key.trim()).filter(key => key);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsage = async (apiKey) => {
    if (apiKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/key', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        if (response.ok) {
          const keyData = await response.json();
          setUsage(keyData.data);
          console.log('API Usage:', keyData.data);
        } else {
          console.error('Failed to fetch usage data');
        }
      } catch (error) {
        console.error('Error fetching usage data:', error);
      }
    }
  };

  const findAndSetNextValidKey = async () => {
    for (const key of apiKeys) {
      const status = await checkCreditsStatus(key);
      if (status.hasCredits) {
        setCurrentApiKey(key);
        return key;
      }
    }
    return null;
  };

  useEffect(() => {
    const initialize = async () => {
      if (apiKeys.length > 0) {
        const validKey = await findAndSetNextValidKey();
        if (validKey) {
          fetchUsage(validKey);
        }
      }
    };
    initialize();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsReplying(true);

    let apiKey = currentApiKey;
    if (apiKey) {
        const status = await checkCreditsStatus(apiKey);
        if (!status.hasCredits) {
            apiKey = await findAndSetNextValidKey();
        }
    } else {
        apiKey = await findAndSetNextValidKey();
    }

    if (!apiKey) {
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: `Error: No valid API key with credits found.` }]);
      setIsReplying(false);
      return;
    }

    const apiMessages = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Your responses must strictly use KaTeX for all mathematical notation. For **inline** mathematics, wrap the expression in single dollar signs. Example: `The equation is $E=mc^2$.` For **block** mathematics, wrap the expression in double dollar signs. Example: `$ \sum_{i=1}^{n} i = \frac{n(n+1)}{2} $` Do not use brackets like `\[ ... \]` or `\( ... \)`. Do not use plain text for math. For example, instead of writing x^2, write `$x^2'      },
      ...newMessages
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat-v3.1:free",
        "messages": apiMessages,
        "stream": true,
        
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
          // important for streaming
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsReplying(false);
              fetchUsage(apiKey); // Fetch usage at the end of the stream
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                console.error(`Stream error: ${parsed.error.message}`);
                botMessageContent += `Error: ${parsed.error.message}`;
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
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.content}</ReactMarkdown>
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
          placeholder="> Type your message..."
          disabled={isReplying}
        />
        <button onClick={handleSend} disabled={isReplying}>Send</button>
      </div>
    </div>
  );
};

export default Floride;