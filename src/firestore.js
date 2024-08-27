import { db } from './firebase';
import { collection, addDoc, doc, setDoc, getDoc, query, where, getDocs, Timestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';

// Function to create a new user in Firestore
export const createUserProfile = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);
  if (userSnapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      username: user.email.split('@')[0],
      online: false,
    });
    console.log('User profile created:', user.uid);
  }
};

// Function to detect URLs in text
const detectUrls = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex);
};

// Function to send a message
export const sendMessage = async (chatId, senderId, text, replyTo = null) => {
  const urls = detectUrls(text);
  const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    urls: urls || [], // Store detected URLs
    createdAt: Timestamp.now(),
    reactions: [],
    replyTo,
  });

  return messageRef.id;
};

// Function to send a message with an image
export const sendMessageWithImage = async (chatId, senderId, text, imageUrl, replyTo = null) => {
  const urls = detectUrls(text);
  const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    imageUrl,
    urls: urls || [], // Store detected URLs
    createdAt: Timestamp.now(),
    reactions: [],
    replyTo,
  });

  return messageRef.id;
};

// Function to upload an image to Firebase Storage
export const uploadImage = async (file) => {
  const storage = getStorage();
  const storageRef = ref(storage, `images/${file.name}_${Date.now()}`);

  // Upload the file to Firebase Storage
  const snapshot = await uploadBytes(storageRef, file);

  // Get the downloadable URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return downloadURL;
};

// Function to add a reaction to a message
export const addReaction = async (chatId, messageId, emoji, userId) => {
  const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
  await updateDoc(messageRef, {
    reactions: arrayUnion({ emoji, userId }),
  });
};

// Function to fetch URL metadata
export const fetchUrlMetadata = async (url) => {
    const response = await axios.get(`https://opengraph.io/api/1.1/site/${ encodeURIComponent(url) }`, {
        params: {
          app_id: import.meta.env.VITE_OPEN_GRAPH_APP_ID, // Replace with your OpenGraph.io API key
        },
      });
    return response.data;
};


// Function to create or retrieve an existing private chat
export const createOrGetPrivateChat = async (currentUserUid, otherUserUid) => {
    const q = query(
      collection(db, 'chats'),
      where('isGroupChat', '==', false),
      where('members', 'array-contains', currentUserUid)
    );
  
    const querySnapshot = await getDocs(q);
    
    let chatId = null;
  
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.members.includes(otherUserUid)) {
        chatId = doc.id;
      }
    });
  
    if (chatId) {
      return chatId; // Return existing chat ID
    } else {
      const newChatRef = await addDoc(collection(db, 'chats'), {
        chatName: '',
        isGroupChat: false,
        members: [currentUserUid, otherUserUid],
        createdAt: Timestamp.now(),
      });
  
      return newChatRef.id;
    }
};

// Function to get a user's UID by their email
export const getUserUidByEmail = async (email) => {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id; // Return the UID of the first match
    } else {
      return null;
    }
};
  
  

export const createGroupChat = async (chatName, members) => {
    const chatRef = await addDoc(collection(db, 'chats'), {
        chatName: chatName,
        isGroupChat: true,
        members: members,
        createdAt: Timestamp.now(),
    });

    return chatRef.id;
};