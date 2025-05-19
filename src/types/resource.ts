export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'worksheet' | 'training' | 'assessment';
  category: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'video';
  tags: string[];
  createdAt: number;
  updatedAt: number;
  downloadCount: number;
}

export const resourceCategories = [
  'Anxiety Management',
  'Depression Support',
  'Relationship Building',
  'Stress Reduction',
  'Career Development',
  'Personal Growth',
  'Crisis Intervention',
  'Assessment Tools',
  'Treatment Plans',
  'Progress Tracking'
];