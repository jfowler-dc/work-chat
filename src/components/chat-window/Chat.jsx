import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import { db } from '../../firebase';
import { sendMessage, addReaction, uploadImage, sendMessageWithImage } from '../../firestore';
import { useParams, Link } from 'react-router-dom';
import UrlPreview from './UrlPreview'; // Adjust the path based on your file structure

const Chat = ({ setActiveChatId }) => {
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [image, setImage] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true); // State to track if we should auto-scroll
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    setActiveChatId(chatId);

    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
      setLoadingMessages(false);

      if (shouldScrollToBottom) {
        scrollToBottom();
      }
    });

    return () => {
      setActiveChatId(null);
      unsubscribe();
    };
  }, [chatId, setActiveChatId, shouldScrollToBottom]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' && !image) return;

    if (image) {
      const imageUrl = await uploadImage(image);
      await sendMessageWithImage(chatId, currentUser.uid, newMessage, imageUrl, replyTo);
      setImage(null);
    } else {
      await sendMessage(chatId, currentUser.uid, newMessage, replyTo);
    }

    setNewMessage('');
    setReplyTo(null);
    setShouldScrollToBottom(true); // Scroll to bottom when sending a new message
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newMessage.trim() !== '') {
      handleSendMessage();
    }
  };

  const handleReply = (messageId) => {
    const messageToReply = messages.find(m => m.id === messageId);
    setReplyTo(messageToReply);
  };

  const handleAddReaction = async (messageId, emoji) => {
    setShouldScrollToBottom(false); // Prevent auto-scroll on reaction
    await addReaction(chatId, messageId, emoji, currentUser.uid);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const emojiList = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <div className="chat-container">
      <div className="chat-header">
        <ul>
          <li><Link to="/start-private-chat">Start Private Chat</Link></li>
          <li><Link to="/start-group-chat">Start Group Chat</Link></li>
        </ul>
      </div>
      <div className="messages">
        {loadingMessages ? <p>Loading messages...</p> : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.senderId === currentUser.uid ? 'message-sender' : 'message-receiver'}`}
              >
                {msg.replyTo && (
                  <div className="reply">
                    <p>Replying to: {messages.find(m => m.id === msg.replyTo)?.text}</p>
                  </div>
                )}
                <p>{msg.text}</p>
                {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded" />}
                {msg.urls && msg.urls.map((url, index) => (
                  <UrlPreview key={index} url={url} />
                ))}
                <div className="reactions">
                  {msg.reactions && msg.reactions.map((reaction, index) => (
                    <span key={index}>{reaction.emoji}</span>
                  ))}
                  <div className="reaction-popup">
                    {emojiList.map((emoji) => (
                      <button key={emoji} onClick={() => handleAddReaction(msg.id, emoji)}>{emoji}</button>
                    ))}
                  </div>
                </div>
                <div className="message-actions">
                  <button className="reply-button" onClick={() => handleReply(msg.id)}>Reply</button>
                </div>
                <span>{new Date(msg.createdAt.seconds * 1000).toLocaleTimeString()}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <div className="input-area">
        {replyTo && (
          <div className="replying-to">
            <p>Replying to: {replyTo.text}</p>
            <button onClick={handleCancelReply}>Cancel</button>
          </div>
        )}
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
          onKeyDown={handleKeyDown}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
