import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Sidebar from './components/chat-window/Sidebar';
import Chat from './components/chat-window/Chat';
import StartPrivateChat from './components/chat-window/StartPrivateChat';
import StartGroupChat from './components/chat-window/StartGroupChat';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

const App = () => {
  const { currentUser } = useAuth();
  const [activeChatId, setActiveChatId] = useState(null);

  return ( 
    <Router>
      <div className="app">
        {currentUser ? (
          <>
            <Sidebar activeChatId={activeChatId} />
            <Routes>
              <Route path="/chats/:chatId" element={<Chat setActiveChatId={setActiveChatId} />} />
              <Route path="/start-private-chat" element={<StartPrivateChat />} />
              <Route path="/start-group-chat" element={<StartGroupChat />} />
              <Route path="*" element={<Navigate to="/start-private-chat" replace />} />
            </Routes>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
