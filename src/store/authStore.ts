import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  doc, 
  setDoc, 
  getDoc,
  getFirestore 
} from 'firebase/firestore';
import { auth } from '../firebase/config';
import type { CounselorProfile, Specialization } from '../types/counselor';

interface AuthState {
  user: User | null;
  profile: CounselorProfile | null;
  loading: boolean;
  error: string | null;
  register: (
    email: string, 
    password: string, 
    username: string,
    profileImage: File,
    bio: string,
    specializations: Specialization[]
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUserProfile: (data: Partial<CounselorProfile>) => Promise<void>;
  updateProfilePicture: (file: File) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserSettings: (settings: any) => Promise<void>;
}

const storage = getStorage();
const firestore = getFirestore();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  
  register: async (email, password, username, profileImage, bio, specializations) => {
    set({ loading: true, error: null });
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Upload profile image
      const imageRef = storageRef(storage, `profile-images/${user.uid}`);
      await uploadBytes(imageRef, profileImage);
      const photoURL = await getDownloadURL(imageRef);
      
      // Update user profile
      await updateProfile(user, {
        displayName: username,
        photoURL
      });
      
      // Create counselor profile in 
      const profile: CounselorProfile = {
        uid: user.uid,
        username,
        email,
        photoURL,
        bio,
        specializations,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      await setDoc(doc(firestore, 'counselors', user.uid), profile);
      set({ profile });
      
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const profileDoc = await getDoc(doc(firestore, 'counselors', userCredential.user.uid));
      if (profileDoc.exists()) {
        set({ profile: profileDoc.data() as CounselorProfile });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, profile: null });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  updateUserProfile: async (data) => {
    const { user, profile } = get();
    if (!user || !profile) return;
    
    try {
      const updatedProfile = {
        ...profile,
        ...data,
        updatedAt: Date.now()
      };
      
      await setDoc(doc(firestore, 'counselors', user.uid), updatedProfile);
      set({ profile: updatedProfile });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  
  updateProfilePicture: async (file: File) => {
    const { user, profile } = get();
    if (!user || !profile) return;
    
    set({ loading: true, error: null });
    try {
      // Upload new profile image
      const imageRef = storageRef(storage, `profile-images/${user.uid}`);
      await uploadBytes(imageRef, file);
      const photoURL = await getDownloadURL(imageRef);
      
      // Update auth profile
      await updateProfile(user, { photoURL });
      
      // Update counselor profile in Firestore
      const updatedProfile = {
        ...profile,
        photoURL,
        updatedAt: Date.now()
      };
      
      await setDoc(doc(firestore, 'counselors', user.uid), updatedProfile);
      set({ profile: updatedProfile });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  
  updateUserPassword: async (currentPassword: string, newPassword: string) => {
    const { user } = get();
    if (!user) return;
    
    set({ loading: true, error: null });
    try {
      // Implementation would go here - for now just showing error
      throw new Error("Password update not implemented");
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateUserSettings: async (settings: any) => {
    const { user, profile } = get();
    if (!user || !profile) return;
    
    try {
      const updatedProfile = {
        ...profile,
        settings: {
          ...profile.settings,
          ...settings
        },
        updatedAt: Date.now()
      };
      
      await setDoc(doc(firestore, 'counselors', user.uid), updatedProfile);
      set({ profile: updatedProfile });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  clearError: () => set({ error: null })
}));

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const profileDoc = await getDoc(doc(firestore, 'counselors', user.uid));
    useAuthStore.setState({ 
      user, 
      profile: profileDoc.exists() ? profileDoc.data() as CounselorProfile : null,
      loading: false 
    });
  } else {
    useAuthStore.setState({ user: null, profile: null, loading: false });
  }
});