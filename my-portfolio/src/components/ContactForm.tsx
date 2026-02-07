import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const WEBHOOK_URL = 'http://localhost:5678/webhook/09e33cc3-6ed0-496d-abab-8199b5bacceb';

const ContactForm = () => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const sendForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setIsLoading(true);
    
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          Note: message
        })
      });
      
      if (response.ok) {
        setStatus('sent');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Contact Me</h2>
          <p className="text-lg text-muted-foreground">
            I also do freelance work. Feel free to reach out for collaborations, project inquiries, or just to say hello!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Send a Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={sendForm} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    name="user_name"
                    placeholder="Your Name"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    name="user_email"
                    placeholder="Your Email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </div>
                )}
              </Button>

              {status === 'sent' && (
                <div className="flex items-center space-x-2 p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300 text-sm">Message sent successfully!</span>
                </div>
              )}
              
              {status === 'error' && (
                <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-300 text-sm">Something went wrong. Try again!</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ContactForm;
