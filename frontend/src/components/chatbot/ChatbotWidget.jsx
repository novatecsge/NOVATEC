import React, { useMemo, useRef, useState } from 'react';
import { chatbotService } from '../../services/chatbot.service';
import { useAuthStore } from '../../store/auth.store';

const initialMessages = [
  { role: 'bot', text: 'Hola, soy el asistente de SGE CECyT 9. Puedo ayudarte con QR, vehículos, reservas, mapa, incidentes y reportes.' }
];

const quickQuestions = [
  '¿Cómo uso mi QR?',
  '¿Cómo registro un vehículo?',
  '¿Cómo funciona el mapa?',
  '¿Cómo reporto un incidente?'
];

export default function ChatbotWidget() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.accessToken));
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const unread = useMemo(() => messages.filter((item) => item.role === 'bot').length - 1, [messages]);
  if (!isAuthenticated) return null;

  const send = async (customMessage) => {
    const text = String(customMessage ?? message).trim();
    if (!text || loading) return;
    setMessage('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      const result = await chatbotService.ask(text);
      setMessages((prev) => [...prev, { role: 'bot', text: result?.answer || 'No pude generar una respuesta en este momento.' }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: error?.response?.data?.message || 'No pude conectarme con el asistente. Intenta de nuevo.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus?.(), 100);
    }
  };

  return (
    <div className={`chatbot-widget ${open ? 'is-open' : ''}`}>
      {open ? (
        <section className="chatbot-panel" aria-label="Asistente virtual SGE">
          <header className="chatbot-header">
            <div>
              <strong>Asistente SGE</strong>
              <span>Ayuda rápida del sistema</span>
            </div>
            <button type="button" className="chatbot-close" onClick={() => setOpen(false)} aria-label="Cerrar asistente">×</button>
          </header>
          <div className="chatbot-messages">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`chatbot-message ${item.role}`}>{item.text}</div>
            ))}
            {loading ? <div className="chatbot-message bot is-loading">Escribiendo respuesta...</div> : null}
          </div>
          <div className="chatbot-quick-actions">
            {quickQuestions.map((question) => <button type="button" key={question} onClick={() => send(question)}>{question}</button>)}
          </div>
          <form className="chatbot-form" onSubmit={(event) => { event.preventDefault(); send(); }}>
            <input ref={inputRef} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escribe tu pregunta..." maxLength={500} />
            <button type="submit" disabled={loading || !message.trim()}>Enviar</button>
          </form>
        </section>
      ) : null}
      <button type="button" className="chatbot-fab" onClick={() => setOpen((value) => !value)} aria-label="Abrir asistente virtual">
        <span>💬</span>
        {unread > 0 ? <em>{unread}</em> : null}
      </button>
    </div>
  );
}
