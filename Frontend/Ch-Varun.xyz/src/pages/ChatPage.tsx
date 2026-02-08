export default function ChatPage() {
  return (
    <div className="page-panel chat-page">
      <h2 className="chat-page__title">Chat with my Assistant</h2>
      <p className="chat-page__subtitle">
        Ask me anything about my work, experience, or just say hello.
        My AI assistant is here to help.
      </p>
      <div className="chat-page__input-wrap">
        <input
          className="chat-page__input"
          type="text"
          placeholder="Type your message..."
        />
        <button className="chat-page__send">Send</button>
      </div>
      <span className="chat-page__hint">Powered by AI</span>
    </div>
  );
}
