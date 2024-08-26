import React, { useState } from 'react';
import { createGroupChat, getUserUidByEmail } from '../../firestore';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

const StartGroupChat = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState('');

  const handleCreateGroupChat = async () => {
    const memberEmails = groupMembers.split(',').map(email => email.trim());
    const memberUids = await Promise.all(memberEmails.map(email => getUserUidByEmail(email)));

    if (memberUids.includes(null)) {
      console.log('One or more users not found');
      return;
    }

    const chatId = await createGroupChat(groupName, [currentUser.uid, ...memberUids]);
    navigate(`/chats/${chatId}`);
  };

  return (
    <div>
      <h2>Create a Group Chat</h2>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Group Name"
      />
      <input
        type="text"
        value={groupMembers}
        onChange={(e) => setGroupMembers(e.target.value)}
        placeholder="Enter member emails, separated by commas"
      />
      <button onClick={handleCreateGroupChat}>Create Group</button>
    </div>
  );
};

export default StartGroupChat;
