import React, { useState } from 'react';
import { createOrGetPrivateChat, getUserUidByEmail } from '../../firestore';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

const StartPrivateChat = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [otherUserEmail, setOtherUserEmail] = useState('');

  const handleStartPrivateChat = async () => {
    const otherUserUid = await getUserUidByEmail(otherUserEmail);
    if (!otherUserUid) {
      console.log('User not found');
      return;
    }

    const chatId = await createOrGetPrivateChat(currentUser.uid, otherUserUid);
    navigate(`/chats/${chatId}`);
  };

  return (
    <div>
      <h2>Start a Private Chat</h2>
      <input
        type="text"
        value={otherUserEmail}
        onChange={(e) => setOtherUserEmail(e.target.value)}
        placeholder="Enter user's email"
      />
      <button onClick={handleStartPrivateChat}>Start Chat</button>
    </div>
  );
};

export default StartPrivateChat;
