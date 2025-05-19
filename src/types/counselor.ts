export interface Specialization {
  value: string;
  label: string;
}

export const specializations: Specialization[] = [
  { value: 'anxiety', label: 'Anxiety & Stress Management' },
  { value: 'depression', label: 'Depression' },
  { value: 'relationships', label: 'Relationship Counseling' },
  { value: 'trauma', label: 'Trauma & PTSD' },
  { value: 'addiction', label: 'Addiction Recovery' },
  { value: 'grief', label: 'Grief & Loss' },
  { value: 'career', label: 'Career Counseling' },
  { value: 'family', label: 'Family Therapy' },
  { value: 'youth', label: 'Youth & Adolescent' },
  { value: 'couples', label: 'Couples Therapy' },
  { value: 'eating', label: 'Eating Disorders' },
  { value: 'lgbtq', label: 'LGBTQ+ Support' },
  { value: 'mindfulness', label: 'Mindfulness & Meditation' },
  { value: 'behavioral', label: 'Behavioral Issues' },
  { value: 'academic', label: 'Academic Performance' }
];

export interface TimeSlot {
  time: string;
}

export interface WorkingHours {
  isWorking: boolean;
  availableSlots: TimeSlot[];
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type Schedule = {
  [key in WeekDay]: WorkingHours;
}

export interface CounselorProfile {
  uid: string;
  username: string;
  email: string;
  photoURL: string;
  bio: string;
  specializations: Specialization[];
  createdAt: number;
  updatedAt: number;
  settings?: {
    language?: string;
    timezone?: string;
    currency?: string;
    schedule?: {
      workingHours: Schedule;
    };
    notifications?: {
      email?: boolean;
      sms?: boolean;
      sessionReminders?: boolean;
      paymentNotifications?: boolean;
    };
  };
}