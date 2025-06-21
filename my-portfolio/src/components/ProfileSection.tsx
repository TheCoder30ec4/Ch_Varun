import React, { useState, useRef, useEffect } from 'react';
import './styles/ProfileSection.css';
import { ChatGroq } from '@langchain/groq';


interface Props {
  profile_image_url: string;
  about: string;
  name?: string;
  linkedin?: string;
  children?: React.ReactNode;
}


const llm = new ChatGroq({
  model: "llama3-70b-8192",
  temperature: 0,
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

const ProfileSection: React.FC<Props> = ({ profile_image_url, about, name = "Ch.Varun", linkedin, children }) => {
    // console.log(linkedin)
    if(!linkedin){
        linkedin="";
    }
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      text: "Feel free to ask me anything about my background or projects. I'm here to help!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatMessagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [conversationHistory, setConversationHistory] = useState<{ role: string; content: string }[]>([]);

  const scrollToBottom = () => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTo({
        top: chatMessagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    const newHistory = [...conversationHistory, { role: 'user', content: inputValue }];
    setConversationHistory(newHistory);
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await llm.invoke([
        { role: "system", content: buildSystemPrompt(name, linkedin) },
        ...newHistory
      ]);

      const botContent =
        typeof response.content === "string"
          ? response.content
          : Array.isArray(response.content)
            ? response.content.map((c: any) => (typeof c === "string" ? c : c.text || "")).join(" ")
            : "";

      const botMessage = {
        id: Date.now() + 1,
        text: botContent,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setConversationHistory([...newHistory, { role: 'assistant', content: botContent }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const buildSystemPrompt = (name: string, linkedin: string) => {
    return `You are acting as ${name}. You are answering questions on ${name}'s website, related to their experience, skills, and career. Be friendly, professional, and helpful. Here's their LinkedIn for context:\n${linkedin}. Make sure to answer in 1-2 lines for every question.`;
  };

  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        <div className="profile-image"><img src={profile_image_url} alt="Profile" /></div>
        <div className="profile-info">
          <h1 className="profile-name">{name}</h1>
          <p className="profile-title">Software Developer @ HashedIn by Deloitte</p>
        </div>
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome to my Portfolio-Website</h2>
          <p className="welcome-description">
            {about} Here is my GitHub, you can explore my projects: <a href="https://github.com/TheCoder30ec4">GitHub</a>
          </p>
        </div>

        <div className="chat-interface">
          <h3 className="chat-title">Live Chat with me 🙂</h3>
          <div className="chat-container">
            <div className="chat-messages" ref={chatMessagesContainerRef}>
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.sender}`}>
                  <div className="message-avatar">
                    {message.sender === 'bot' ? (
                      <img src={profile_image_url} alt="Bot Avatar" className="bot-avatar-img" />
                    ) : (
                      <div className="user-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-sender-name">{message.sender === 'bot' ? name : 'You'}</div>
                    <div className="message-bubble">{message.text}</div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message bot">
                  <div className="message-avatar">
                    <img src={profile_image_url} alt="Bot Avatar" className="bot-avatar-img" />
                  </div>
                  <div className="message-content">
                    <div className="message-sender-name">{name}</div>
                    <div className="message-bubble typing">
                      <div className="typing-indicator"><span></span><span></span><span></span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="chat-input"
                />
                <button
                  onClick={handleSendMessage}
                  className="send-button"
                  disabled={!inputValue.trim()}
                  aria-label="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <p className="chat-disclaimer">AI-powered responses may take a moment. Please be patient.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
