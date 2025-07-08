import { createContext, useState } from 'react';
import Message from '../components/Message';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState('success');
  const showMessage = (text, messageType = 'success') => {
    setType(messageType);
    setMessage(text);
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return (
    <MessageContext.Provider value={{ showMessage, clearMessage }}>
      {/* Global Message Component at the Top */}
      { message && <Message message={message} onClose={clearMessage} type={type} />}
      
      {/* App Content */}
      {children}
    </MessageContext.Provider>
  );
};