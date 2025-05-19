import React, { useState } from 'react';
import { FileText, BookOpen, GraduationCap, ClipboardCheck } from 'lucide-react';
import Card from '../../components/ui/Card';

type ResourceCategory = 'guides' | 'worksheets' | 'training' | 'assessments';

interface Resource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  type: 'pdf' | 'doc';
  category: ResourceCategory;
  tags?: string[];
}

const resources: Resource[] = [
  // Guides & Templates
  {
    id: 'g1',
    title: 'First Session Guide',
    description: 'Comprehensive guide for conducting initial therapy sessions, including intake procedures and essential questions.',
    fileUrl: '/resources/first-session-guide.pdf',
    type: 'pdf',
    category: 'guides',
    tags: ['New Clients', 'Intake']
  },
  {
    id: 'g2',
    title: 'Treatment Planning Template',
    description: 'Structured template for creating individualized treatment plans with goal setting and progress tracking.',
    fileUrl: '/resources/treatment-plan.pdf',
    type: 'pdf',
    category: 'guides',
    tags: ['Planning', 'Documentation']
  },
  {
    id: 'g3',
    title: 'Progress Note Templates',
    description: 'SOAP and DAP note templates for documenting therapy sessions professionally.',
    fileUrl: '/resources/progress-notes.doc',
    type: 'doc',
    category: 'guides',
    tags: ['Documentation', 'Professional']
  },
  {
    id: 'g4',
    title: 'Termination Checklist',
    description: 'Guide for properly concluding therapy relationships and ensuring continuity of care.',
    fileUrl: '/resources/termination.pdf',
    type: 'pdf',
    category: 'guides',
    tags: ['Termination', 'Best Practices']
  },

  // Worksheets
  {
    id: 'w1',
    title: 'Anxiety Management Toolkit',
    description: 'Collection of worksheets including breathing exercises, thought records, and anxiety tracking tools.',
    fileUrl: '/resources/anxiety-toolkit.pdf',
    type: 'pdf',
    category: 'worksheets',
    tags: ['Anxiety', 'Coping Skills']
  },
  {
    id: 'w2',
    title: 'Depression Activity Journal',
    description: 'Daily activity and mood tracking worksheet to help clients monitor and improve their mood.',
    fileUrl: '/resources/depression-journal.pdf',
    type: 'pdf',
    category: 'worksheets',
    tags: ['Depression', 'Monitoring']
  },
  {
    id: 'w3',
    title: 'Stress Management Planner',
    description: 'Weekly planner for identifying stressors and implementing coping strategies.',
    fileUrl: '/resources/stress-planner.pdf',
    type: 'pdf',
    category: 'worksheets',
    tags: ['Stress', 'Planning']
  },
  {
    id: 'w4',
    title: 'Relationship Communication Exercises',
    description: 'Interactive worksheets for improving communication in relationships.',
    fileUrl: '/resources/communication.pdf',
    type: 'pdf',
    category: 'worksheets',
    tags: ['Relationships', 'Communication']
  },

  // Training Resources
  {
    id: 't1',
    title: 'Crisis Intervention Training',
    description: 'Comprehensive training materials on handling crisis situations and emergency responses.',
    fileUrl: '/resources/crisis-training.pdf',
    type: 'pdf',
    category: 'training',
    tags: ['Crisis', 'Emergency']
  },
  {
    id: 't2',
    title: 'Ethical Decision Making',
    description: 'Training module on ethical considerations and decision-making in counseling practice.',
    fileUrl: '/resources/ethics-training.pdf',
    type: 'pdf',
    category: 'training',
    tags: ['Ethics', 'Professional Development']
  },
  {
    id: 't3',
    title: 'Cultural Competency Course',
    description: 'Materials for developing cultural awareness and competency in counseling.',
    fileUrl: '/resources/cultural-competency.pdf',
    type: 'pdf',
    category: 'training',
    tags: ['Culture', 'Diversity']
  },
  {
    id: 't4',
    title: 'Telehealth Best Practices',
    description: 'Guidelines and training for conducting effective online therapy sessions.',
    fileUrl: '/resources/telehealth.pdf',
    type: 'pdf',
    category: 'training',
    tags: ['Online Therapy', 'Technology']
  },

  // Assessments
  {
    id: 'a1',
    title: 'Mental Health Assessment Package',
    description: 'Comprehensive collection of mental health screening tools and assessments.',
    fileUrl: '/resources/mental-health-assessment.pdf',
    type: 'pdf',
    category: 'assessments',
    tags: ['Screening', 'Diagnosis']
  },
  {
    id: 'a2',
    title: 'Risk Assessment Tools',
    description: 'Standardized tools for assessing suicide risk and safety planning.',
    fileUrl: '/resources/risk-assessment.pdf',
    type: 'pdf',
    category: 'assessments',
    tags: ['Risk', 'Safety']
  },
  {
    id: 'a3',
    title: 'Progress Monitoring Scales',
    description: 'Validated scales for tracking therapy progress and outcomes.',
    fileUrl: '/resources/progress-monitoring.pdf',
    type: 'pdf',
    category: 'assessments',
    tags: ['Progress', 'Outcomes']
  },
  {
    id: 'a4',
    title: 'Relationship Assessment Tools',
    description: 'Assessment tools for evaluating relationship dynamics and attachment styles.',
    fileUrl: '/resources/relationship-assessment.pdf',
    type: 'pdf',
    category: 'assessments',
    tags: ['Relationships', 'Attachment']
  }
];

function Resources() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory>('guides');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { 
      id: 'guides', 
      name: 'Guides & Templates', 
      icon: FileText,
      description: 'Professional templates and guidance documents for structured therapy sessions'
    },
    { 
      id: 'worksheets', 
      name: 'Worksheets', 
      icon: ClipboardCheck,
      description: 'Interactive worksheets and exercises for client homework and skill development'
    },
    { 
      id: 'training', 
      name: 'Training Resources', 
      icon: GraduationCap,
      description: 'Professional development materials to enhance your counseling skills'
    },
    { 
      id: 'assessments', 
      name: 'Assessments', 
      icon: BookOpen,
      description: 'Standardized assessment tools and outcome measures'
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = resource.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="mt-1 text-sm text-gray-500">
          Access professional resources to enhance your counseling practice
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search resources..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id as ResourceCategory)}
            className={`p-6 rounded-lg border transition-all text-left ${
              activeCategory === category.id
                ? 'bg-blue-50 border-blue-200 shadow-sm'
                : 'bg-white border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <category.icon className={`h-6 w-6 ${
                activeCategory === category.id ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span className={`font-medium ${
                activeCategory === category.id ? 'text-blue-900' : 'text-gray-700'
              }`}>
                {category.name}
              </span>
            </div>
            <p className="text-sm text-gray-600">{category.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <Card key={resource.id}>
            <div className="flex flex-col h-full">
              <div className="flex items-start space-x-4 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  {resource.type === 'pdf' ? (
                    <FileText className="h-6 w-6 text-blue-600" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{resource.description}</p>
                </div>
              </div>
              
              {resource.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="mt-auto">
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Download {resource.type.toUpperCase()}
                  <svg className="ml-2 -mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Resources;