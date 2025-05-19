export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  concerns: string[];
  goals: string[];
  notes: string;
  joinedOn: string;
  lastSessionDate?: string;
  sessionsCount: number;
  profileImage?: string;
  status: 'active' | 'inactive' | 'pending';
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
}

export interface FilterCriteria {
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
  sessionsCount: {
    min: number;
    max: number;
  };
  concerns: string[];
}