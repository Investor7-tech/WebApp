import { collection, query, where, getDocs, updateDoc, doc, getDoc, DocumentData, deleteDoc, addDoc } from 'firebase/firestore';
import { firestore } from './config';
import { Session } from '../types/session';
import { useNotificationStore } from '../store/notificationStore';

// Helper function to parse session data
const parseSession = (data: DocumentData): Session => {
  return {
    sessionId: data.sessionId || '',
    counselorId: data.counselorId || '',
    userId: data.userId || '',
    userName: data.userName || '',
    userEmail: data.userEmail || '',
    userPhone: data.userPhone || '',
    userBio: data.userBio || '',
    sessionDate: data.sessionDate || new Date().toISOString(),
    duration: data.duration || 0,
    status: data.status || 'scheduled',
    concerns: data.concerns || [],
    goals: data.goals || [],
    notes: data.notes || '',
    profilePicture: data.profilePicture || null
  };
};

export const fetchCounselorSessions = async (counselorId: string): Promise<Session[]> => {
  try {
    const sessionsRef = collection(firestore, 'sessions');
    const sessionsQuery = query(sessionsRef, where('counselorId', '==', counselorId));
    const sessionSnapshot = await getDocs(sessionsQuery);
    
    // Fetch all sessions and their corresponding user data
    const sessions = await Promise.all(sessionSnapshot.docs.map(async (document) => {
      const sessionData = document.data();
      const userId = sessionData.userId;
      
      // Fetch user data to get profile picture
      const userRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      return parseSession({
        sessionId: document.id,
        ...sessionData,
        profilePicture: userData?.profilePicture || null
      });
    }));

    return sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

export const createSession = async (sessionData: Omit<Session, 'sessionId'>): Promise<Session> => {
  try {
    const sessionsRef = collection(firestore, 'sessions');
    const docRef = await addDoc(sessionsRef, sessionData);
    
    const newSession = {
      sessionId: docRef.id,
      ...sessionData
    };

    // Trigger notification for new session
    useNotificationStore.getState().addSessionBookingNotification(newSession);

    return newSession;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const updateSessionStatus = async (sessionId: string, status: Session['status']): Promise<void> => {
  try {
    const sessionRef = doc(firestore, 'sessions', sessionId);
    await updateDoc(sessionRef, { status });
  } catch (error) {
    console.error('Error updating session status:', error);
    throw error;
  }
};

export const getSessionById = async (sessionId: string): Promise<Session | null> => {
  try {
    const sessionRef = doc(firestore, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);
    
    if (!sessionDoc.exists()) {
      return null;
    }
    
    return parseSession({
      sessionId,
      ...sessionDoc.data()
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const sessionRef = doc(firestore, 'sessions', sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};