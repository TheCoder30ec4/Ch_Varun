import {useRef,useState} from 'react';
import './styles/ContactForm.css'

const WEBHOOK_URL = 'http://localhost:5678/webhook/09e33cc3-6ed0-496d-abab-8199b5bacceb';
// const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE'; // <-- Replace with your actual token

const ContactForm = () =>{
    const formRef = useRef<HTMLFormElement | null>(null);
    const [status,setstatus] = useState<'idle' | 'sent' | 'error'>('idle')
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const sendForm = async (e:React.FormEvent) => {
        e.preventDefault();
        setstatus('idle');
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
                setstatus('sent');
                setName('');
                setEmail('');
                setMessage('');
            } else {
                setstatus('error');
            }
        } catch (err) {
            setstatus('error');
        }
    };

    return (
        <section className="contact-form-section">
            <h2 className="section-title" >Contact Me</h2>
            <p className="section-subtitle">I also do freelance work. Feel free to reach out for collaborations, project inquiries, or just to say hello!</p>
            <form ref={formRef} onSubmit={sendForm} className="contact-form">
                <input type="text" name='user_name' placeholder='Your Name' required value={name} onChange={e => setName(e.target.value)} />
                <input type="email" name='user_email' placeholder='Your Email' required value={email} onChange={e => setEmail(e.target.value)} />
                <textarea name="message" placeholder='Your Message' rows={5} value={message} onChange={e => setMessage(e.target.value)} required ></textarea>
                <button type='submit'>
                    Send Message
                </button>
                {status === 'sent' && <p className="status success">Message sent successfully!</p>}
                {status === 'error' && <p className="status error">Something went wrong. Try again!</p>}
            </form>
        </section>
    )
}

export default ContactForm;
