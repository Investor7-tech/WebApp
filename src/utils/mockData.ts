import { Specialization } from '../types/counselor';

export interface CounselorStats {
  upcomingSessions: number;
  activeStudents: number;
  totalEarnings: number;
  averageRating: number;
  sessionsCompleted: number;
  sessionsTrend: {
    value: number;
    isPositive: boolean;
  };
  earningsTrend: {
    value: number;
    isPositive: boolean;
  };
  studentsTrend: {
    value: number;
    isPositive: boolean;
  };
}

export interface Session {
  id: string;
  studentName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  joinedOn: string;
  sessionsCount: number;
  lastSessionDate?: string;
  profileImage?: string;
  bio: string;
  concerns: string[];
  goals: string[];
  age: number;
  gender: string;
  occupation: string;
  preferredLanguage: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  notes: string;
  progress: {
    initialAssessment: string;
    currentStatus: string;
    recommendations: string[];
  };
}

export interface Earning {
  id: string;
  amount: number;
  date: string;
  sessionId: string;
  studentName: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

// Mock counselor stats data
export const getCounselorStats = (): CounselorStats => {
  return {
    upcomingSessions: 12,
    activeStudents: 24,
    totalEarnings: 5280,
    averageRating: 4.8,
    sessionsCompleted: 185,
    sessionsTrend: {
      value: 8.3,
      isPositive: true,
    },
    earningsTrend: {
      value: 12.7,
      isPositive: true,
    },
    studentsTrend: {
      value: 5.2,
      isPositive: true,
    },
  };
};

// Mock sessions data
export const getSessions = (): Session[] => {
  return [
    {
      id: '1',
      studentName: 'Emma Thompson',
      date: '2025-06-01',
      time: '10:00 AM',
      duration: 60,
      status: 'scheduled',
    },
    {
      id: '2',
      studentName: 'James Wilson',
      date: '2025-06-01',
      time: '2:30 PM',
      duration: 45,
      status: 'scheduled',
    },
    {
      id: '3',
      studentName: 'Olivia Parker',
      date: '2025-06-02',
      time: '11:15 AM',
      duration: 60,
      status: 'scheduled',
    },
    {
      id: '4',
      studentName: 'Noah Martinez',
      date: '2025-06-03',
      time: '3:00 PM',
      duration: 45,
      status: 'scheduled',
    },
    {
      id: '5',
      studentName: 'Sophia Lewis',
      date: '2025-05-29',
      time: '1:00 PM',
      duration: 60,
      status: 'completed',
      notes: 'Discussed anxiety management techniques and assigned breathing exercises.',
    },
    {
      id: '6',
      studentName: 'Benjamin Clark',
      date: '2025-05-28',
      time: '11:00 AM',
      duration: 45,
      status: 'completed',
      notes: 'Follow-up on academic stress. Showing improvement with time management.',
    },
    {
      id: '7',
      studentName: 'Ava Rodriguez',
      date: '2025-05-28',
      time: '2:15 PM',
      duration: 60,
      status: 'cancelled',
    },
    {
      id: '8',
      studentName: 'William Johnson',
      date: '2025-05-27',
      time: '4:30 PM',
      duration: 45,
      status: 'completed',
      notes: 'Initial assessment. Goal-setting for future sessions.',
    },
  ];
};

// Mock students data
export const getStudents = (): Student[] => {
  return [
    {
      id: '1',
      name: 'Emma Thompson',
      email: 'emma.thompson@example.com',
      joinedOn: '2025-01-15',
      sessionsCount: 12,
      lastSessionDate: '2025-05-29',
      profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      bio: 'Final year university student dealing with academic pressure and career uncertainty.',
      concerns: ['Anxiety', 'Career Planning', 'Academic Stress'],
      goals: ['Improve stress management', 'Develop career plan', 'Better work-life balance'],
      age: 22,
      gender: 'Female',
      occupation: 'Student',
      preferredLanguage: 'English',
      emergencyContact: {
        name: 'Mary Thompson',
        relationship: 'Mother',
        phone: '+1-555-0123'
      },
      medicalHistory: {
        conditions: ['Anxiety'],
        medications: ['None'],
        allergies: ['None']
      },
      notes: 'Shows good progress in anxiety management. Needs support in career decision-making.',
      progress: {
        initialAssessment: 'Moderate anxiety related to academic performance and future career',
        currentStatus: 'Improving - developing better coping mechanisms',
        recommendations: ['Continue weekly sessions', 'Practice mindfulness exercises', 'Career counseling focus']
      }
    },
    {
      id: '2',
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      joinedOn: '2025-02-03',
      sessionsCount: 8,
      lastSessionDate: '2025-05-28',
      profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      bio: 'Young professional struggling with work-related stress and relationship issues.',
      concerns: ['Work Stress', 'Relationship Issues', 'Depression'],
      goals: ['Better work-life balance', 'Improve communication skills', 'Manage depression symptoms'],
      age: 28,
      gender: 'Male',
      occupation: 'Software Engineer',
      preferredLanguage: 'English',
      emergencyContact: {
        name: 'Sarah Wilson',
        relationship: 'Sister',
        phone: '+1-555-0124'
      },
      medicalHistory: {
        conditions: ['Mild Depression'],
        medications: ['Sertraline'],
        allergies: ['Penicillin']
      },
      notes: 'Making progress in work-life balance. Relationship communication improving.',
      progress: {
        initialAssessment: 'Work-related burnout affecting personal relationships',
        currentStatus: 'Showing improvement in stress management',
        recommendations: ['Continue bi-weekly sessions', 'Relationship counseling', 'Stress management techniques']
      }
    },
    // Add similar detailed profiles for other students...
  ];
};

// Mock earnings data
export const getEarnings = (): Earning[] => {
  return [
    {
      id: '1',
      amount: 120,
      date: '2025-05-29',
      sessionId: '5',
      studentName: 'Sophia Lewis',
      paymentStatus: 'paid',
    },
    {
      id: '2',
      amount: 90,
      date: '2025-05-28',
      sessionId: '6',
      studentName: 'Benjamin Clark',
      paymentStatus: 'paid',
    },
    {
      id: '3',
      amount: 120,
      date: '2025-05-27',
      sessionId: '8',
      studentName: 'William Johnson',
      paymentStatus: 'paid',
    },
    {
      id: '4',
      amount: 60,
      date: '2025-05-26',
      sessionId: '9',
      studentName: 'Ava Rodriguez',
      paymentStatus: 'pending',
    },
    {
      id: '5',
      amount: 90,
      date: '2025-05-25',
      sessionId: '10',
      studentName: 'James Wilson',
      paymentStatus: 'paid',
    },
    {
      id: '6',
      amount: 120,
      date: '2025-05-24',
      sessionId: '11',
      studentName: 'Emma Thompson',
      paymentStatus: 'paid',
    },
    {
      id: '7',
      amount: 90,
      date: '2025-05-23',
      sessionId: '12',
      studentName: 'Noah Martinez',
      paymentStatus: 'failed',
    },
    {
      id: '8',
      amount: 120,
      date: '2025-05-22',
      sessionId: '13',
      studentName: 'Olivia Parker',
      paymentStatus: 'paid',
    },
  ];
};