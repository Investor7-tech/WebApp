export interface Session {
  sessionId: string;
  counselorId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userBio?: string;
  sessionDate: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  concerns?: string[];
  goals?: string[];
  notes?: string;
  profilePicture?: string;
}