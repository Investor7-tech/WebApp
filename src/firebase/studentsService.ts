import { collection, query, where, getDocs, DocumentData, doc, getDoc } from 'firebase/firestore';
import { firestore } from './config';

export interface FirestoreStudent {
  uid?: string;
  bio: string;
  concerns: string[];
  createdAt: string;
  email: string;
  emergencyContact: {
    name: string;
    phoneCountryCode: string;
    phoneNumber: string;
    relationship: string;
  };
  goals: string[];
  lastUpdated: Date;
  medicalHistory: {
    allergies: string;
    conditions: string;
    medications: string;
  };
  name: string;
  phoneNumber: string;
  phone: string;
  phoneCountryCode: string;
  profileCompletionPercentage: number;
  profilePicture?: string;
  userBio: string;
}

export const fetchCounselorStudents = async (counselorId: string): Promise<FirestoreStudent[]> => {
  console.log('Starting to fetch students for counselor:', counselorId);
  
  try {
    // First, get all sessions for this counselor
    const sessionsRef = collection(firestore, 'sessions');
    const sessionsQuery = query(sessionsRef, where('counselorId', '==', counselorId));
    
    const sessionSnapshot = await getDocs(sessionsQuery);
    console.log('Found sessions:', sessionSnapshot.size);

    if (sessionSnapshot.empty) {
      console.log('No sessions found for counselor:', counselorId);
      return [];
    }

    // Create a map to store unique student data
    const studentMap = new Map<string, DocumentData>();

    // Collect all unique student IDs from sessions
    for (const sessionDoc of sessionSnapshot.docs) {
      const sessionData = sessionDoc.data();
      console.log('Processing session:', sessionDoc.id, sessionData);
      
      // Get student ID from either userId or studentId field
      const studentId = sessionData.userId || sessionData.studentId;
      
      if (studentId && !studentMap.has(studentId)) {
        console.log('Fetching data for student:', studentId);
        try {
          // Try getting user data directly from the users collection using doc()
          const userDoc = await getDoc(doc(firestore, 'users', studentId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Found user data:', userData);

            // Only include users with valid name and email
            if (userData.name && userData.email && userData.name !== 'Unknown') {
              // Create a complete student profile
              const studentProfile: FirestoreStudent = {
                uid: studentId,
                bio: userData.bio || '',
                concerns: userData.concerns || [],
                createdAt: userData.createdAt || new Date().toISOString(),
                email: userData.email,
                emergencyContact: userData.emergencyContact || {
                  name: '',
                  phoneCountryCode: '',
                  phoneNumber: '',
                  relationship: ''
                },
                goals: userData.goals || [],
                lastUpdated: userData.lastUpdated ? new Date(userData.lastUpdated) : new Date(),
                medicalHistory: userData.medicalHistory || {
                  allergies: '',
                  conditions: '',
                  medications: ''
                },
                name: userData.name,
                phoneNumber: userData.phone || '',
                phone: userData.phone || '',
                phoneCountryCode: userData.phoneCountryCode || '',
                profileCompletionPercentage: userData.profileCompletionPercentage || 0,
                profilePicture: userData.profilePicture,
                userBio: userData.userBio || userData.bio || ''
              };
              
              studentMap.set(studentId, studentProfile);
              console.log('Added complete student profile:', studentProfile);
            } else {
              console.log('Skipping incomplete user profile:', studentId);
            }
          } else {
            console.log('No user document found for ID:', studentId);
          }
        } catch (error) {
          console.error('Error fetching user data:', studentId, error);
        }
      }
    }

    console.log('Total unique students found:', studentMap.size);
    
    // Convert the map to array and ensure all fields are present
    const students = Array.from(studentMap.values()) as FirestoreStudent[];
    console.log('Returning filtered students:', students.length);
    return students;

  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};