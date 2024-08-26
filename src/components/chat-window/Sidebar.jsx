import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const Sidebar = ({ activeChatId }) => {
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [unreadChats, setUnreadChats] = useState({});
  const { currentUser, logout } = useAuth();
  const location = useLocation();  // Hook to get the current location

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', currentUser.uid)
    );

    const unsubscribeChats = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      });
      setChats(chatData);
      
      const unread = {};
      chatData.forEach(chat => {
        if (chat.id !== activeChatId) {
          const lastMessage = chat.lastMessage || {};
          if (lastMessage.timestamp > (currentUser.lastReadTimestamps?.[chat.id] || 0)) {
            unread[chat.id] = true;
          }
        }
      });
      setUnreadChats(unread);
    });

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userData);
    });

    return () => {
      unsubscribeChats();
      unsubscribeUsers();
    };
  }, [currentUser, activeChatId]);

  return (
    <div className="sidebar">
      <h2>Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.id}
            style={{ fontWeight: unreadChats[chat.id] ? 'bold' : 'normal' }}
            className={location.pathname.includes(chat.id) ? 'active-chat' : ''}
          >
            <Link to={`/chats/${chat.id}`}>
              {chat.isGroupChat ? chat.chatName : "Private Chat"}
            </Link>
          </li>
        ))}
      </ul>

      <h2>Start a New Chat</h2>
      <ul>
        <li><Link to="/start-private-chat">Start Private Chat</Link></li>
        <li><Link to="/start-group-chat">Start Group Chat</Link></li>
      </ul>

      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <span>{user.username}</span> - 
            <span style={{ color: user.online ? 'green' : 'red' }}>
              {user.online ? 'Online' : `Last seen at ${user.lastSeen ? new Date(user.lastSeen.seconds * 1000).toLocaleString() : 'unknown time'}`}
            </span>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <button onClick={logout} style={{ width: '100%' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
