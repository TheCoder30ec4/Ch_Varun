import React, { useState, useRef, useEffect } from 'react';
import { ChatGroq } from '@langchain/groq';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Send, User, Bot } from 'lucide-react';

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
  if (!linkedin) {
    linkedin = "";
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
      // swallow to keep UI responsive
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
    <section className="container mx-auto px-4 py-16" id="home">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Profile Info */}
        <div className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <img 
                src={profile_image_url} 
                alt="Profile" 
                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{name}</h1>
              <p className="text-xl text-muted-foreground">Software Developer @ HashedIn by Deloitte</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Welcome to my Portfolio</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {about} Here is my GitHub, you can explore my projects:{' '}
              <a 
                href="https://github.com/TheCoder30ec4" 
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Live Chat with me 🙂</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex min-h-0 flex-col space-y-4">
            <div 
              className="flex-1 min-h-0 overflow-y-scroll custom-scrollbar space-y-4 pr-2"
              ref={chatMessagesContainerRef}
            >
              {messages.map((message) => (
                <div key={message.id} className={`flex space-x-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'bot' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <img src={profile_image_url} alt="Bot Avatar" className="h-6 w-6 rounded-full" />
                    </div>
                  )}
                  <div className={`max-w-[80%] space-y-1 ${message.sender === 'user' ? 'order-first' : ''}`}>
                    <div className="text-xs text-muted-foreground">
                      {message.sender === 'bot' ? name : 'You'}
                    </div>
                    <div className={`rounded-lg px-3 py-2 text-sm ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                    }`}>
                      {message.text}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <img src={profile_image_url} alt="Bot Avatar" className="h-6 w-6 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">{name}</div>
                    <div className="rounded-lg px-3 py-2 text-sm bg-muted">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot"></div>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot"></div>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="Type your message here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              AI-powered responses may take a moment. Please be patient.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProfileSection;
