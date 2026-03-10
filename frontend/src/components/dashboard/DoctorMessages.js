import React, { useState, useEffect } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import MessageIcon from '@mui/icons-material/Message';
import './DoctorMessages.css';

const DoctorMessages = ({ setUnreadMessages }) => {
  const [messages, setMessages] = useState([
    { id: 1, patient: 'María González', content: 'Tengo un dolor en el pecho, ¿puedo venir mañana?', time: '10:30 AM', unread: true },
    { id: 2, patient: 'Juan Pérez', content: 'Gracias doctor por su atención', time: '9:45 AM', unread: true },
    { id: 3, patient: 'Ana Martínez', content: 'Recuerdo que debo realizar los análisis', time: 'Ayer', unread: false },
    { id: 4, patient: 'Carlos López', content: '¿A qué hora es mi cita?', time: '2 días atrás', unread: false }
  ]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatHistory] = useState({});

  useEffect(() => {
    const unreadCount = messages.filter(m => m.unread).length;
    setUnreadMessages(unreadCount);
  }, [messages, setUnreadMessages]);

  const handleSelectChat = (message) => {
    setSelectedChat(message.id);
    setMessages(messages.map(m => m.id === message.id ? { ...m, unread: false } : m));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    if (!chatHistory[selectedChat]) {
      chatHistory[selectedChat] = [];
    }

    chatHistory[selectedChat].push({
      type: 'sent',
      content: newMessage,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    });

    setNewMessage('');
  };

  const selectedMessage = messages.find(m => m.id === selectedChat);

  return (
    <div className="doctor-messages">
      <div className="messages-list">
        <div className="messages-header">
          <h3>Mensajes</h3>
          <input
            type="text"
            placeholder="Buscar conversación..."
            className="messages-search"
          />
        </div>

        <div className="messages-conversations">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-item ${selectedChat === message.id ? 'active' : ''} ${message.unread ? 'unread' : ''}`}
              onClick={() => handleSelectChat(message)}
            >
              <div className="message-avatar"><PersonIcon fontSize="small" /></div>
              <div className="message-info">
                <p className="message-patient">{message.patient}</p>
                <p className="message-preview">{message.content}</p>
              </div>
              <div className="message-meta">
                <span className="message-time">{message.time}</span>
                {message.unread && <div className="unread-badge"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="messages-chat">
        {selectedMessage ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <span className="chat-avatar"><PersonIcon /></span>
                <div>
                  <h3>{selectedMessage.patient}</h3>
                  <p>En línea</p>
                </div>
              </div>
              <div className="chat-actions">
              </div>
            </div>

            <div className="chat-messages">
              {/* Mensajes previos */}
              <div className="chat-message received">
                <p>{selectedMessage.content}</p>
                <span className="message-timestamp">{selectedMessage.time}</span>
              </div>

              {/* Historial del chat */}
              {chatHistory[selectedChat] && chatHistory[selectedChat].map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.type}`}>
                  <p>{msg.content}</p>
                  <span className="message-timestamp">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} className="chat-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="chat-input"
                />
                <button type="submit" className="chat-send-btn"><SendIcon fontSize="small" /> Enviar</button>
              </form>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <MessageIcon sx={{ fontSize: 48, color: '#a0aec0' }} />
            <p>Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorMessages;
