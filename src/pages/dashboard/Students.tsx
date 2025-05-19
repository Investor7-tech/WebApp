import React, { useState, useEffect } from 'react';
import { Search, Mail, Filter, X, User, Phone, ChevronRight, Clock, Tag, Heart, FileText, ClipboardCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import { fetchCounselorStudents, FirestoreStudent } from '../../firebase/studentsService';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/config';

interface Assessment {
  assessment_id: string;
  customer_id: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
  session_id: string;
  timestamp: string;
}

const Students: React.FC = () => {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<FirestoreStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<FirestoreStudent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    concerns: [] as string[],
    goals: [] as string[],
    completionPercentage: ''
  });
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [user]);

  const loadStudents = async () => {
    if (!user?.uid) {
      console.log('No user logged in');
      setError('Please log in to view students');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading students for counselor:', { 
        counselorId: user.uid, 
        email: user.email
      });
      setLoading(true);
      setError(null);
      
      // Check if the counselor document exists
      const counselorDoc = await getDoc(doc(firestore, 'counselors', user.uid));
      console.log('Counselor document exists:', counselorDoc.exists(), 
        'Data:', counselorDoc.data());
      
      const fetchedStudents = await fetchCounselorStudents(user.uid);
      console.log('Fetched students:', fetchedStudents);
      setStudents(fetchedStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      if (error instanceof Error) {
        // Check for Firebase missing index errors
        if (error.message.includes('indexes?')) {
          setError('Database index error. Please contact support.');
        } else {
          setError('Failed to load students. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string, countryCode: string) => {
    if (!phone) return 'No phone number provided';
    return `${countryCode || ''} ${phone}`.trim();
  };

  const fetchAssessment = async (studentId: string) => {
    try {
      setAssessmentLoading(true);
      const assessmentsRef = collection(firestore, 'assessments');
      const q = query(assessmentsRef, where('customer_id', '==', studentId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const assessmentData = querySnapshot.docs[0].data() as Assessment;
        setSelectedAssessment(assessmentData);
        setShowAssessmentModal(true);
      } else {
        setSelectedAssessment(null);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      setSelectedAssessment(null);
    } finally {
      setAssessmentLoading(false);
    }
  };

  const filteredStudents = students
    // First filter out unknown/incomplete users
    .filter(student => 
      student.name !== 'Unknown' && 
      student.name !== '' && 
      student.email && 
      student.email !== ''
    )
    // Then apply search and other filters
    .filter(student => {
      const matchesSearch = searchQuery === '' || 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesConcerns = filters.concerns.length === 0 || 
        filters.concerns.some(concern => student.concerns.includes(concern));
      
      const matchesGoals = filters.goals.length === 0 ||
        filters.goals.some(goal => student.goals.includes(goal));
      
      return matchesSearch && matchesConcerns && matchesGoals;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 inline-block mx-auto px-4 py-2 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadStudents}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your student information and counseling relationships.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Concerns</label>
              <select
                multiple
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFilters(prev => ({ ...prev, concerns: values }));
                }}
              >
                <option value="Depression">Depression</option>
                <option value="Career Planning">Career Planning</option>
                <option value="Relationship Issues">Relationship Issues</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Goals</label>
              <select
                multiple
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  setFilters(prev => ({ ...prev, goals: values }));
                }}
              >
                <option value="Improve stress management">Improve stress management</option>
                <option value="Develop career plan">Develop career plan</option>
                <option value="Better work-life balance">Better work-life balance</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <li key={student.uid}>
                <div>
                  {/* Student summary - clicking this toggles details */}
                  <div
                    onClick={() => setSelectedStudent(selectedStudent?.uid === student.uid ? null : student)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedStudent?.uid === student.uid ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center px-6 py-6">
                      <div className="flex min-w-0 flex-1 items-center">
                        <div className="flex-shrink-0">
                          {student.profilePicture ? (
                            <img
                              className="h-16 w-16 rounded-full object-cover"
                              src={student.profilePicture}
                              alt={student.name}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-xl">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 px-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">{student.name}</p>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {student.email}
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                {formatPhoneNumber(student.phone || student.phoneNumber, student.phoneCountryCode)}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Joined {formatDate(student.createdAt)}</span>
                              </div>
                              <div className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  student.profileCompletionPercentage === 100
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  Profile: {student.profileCompletionPercentage}% Complete
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 line-clamp-2">{student.userBio || student.bio}</p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {student.concerns.slice(0, 3).map((concern, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {concern}
                              </span>
                            ))}
                            {student.concerns.length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{student.concerns.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight 
                        className={`h-5 w-5 text-gray-400 transform transition-transform ${
                          selectedStudent?.uid === student.uid ? 'rotate-90' : ''
                        }`} 
                      />
                    </div>
                  </div>

                  {/* Expanded details section - shows when selected */}
                  {selectedStudent?.uid === student.uid && (
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                      <div className="space-y-6">
                        {/* Bio Section */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                          <p className="text-gray-600">{student.userBio || student.bio}</p>
                        </div>

                        {/* Concerns and Goals */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                              <Heart className="h-5 w-5 mr-2 text-blue-500" />
                              Concerns
                            </h3>
                            <div className="space-y-2">
                              {student.concerns.map((concern, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2 text-sm text-gray-600 bg-white p-2 rounded-md"
                                >
                                  <Tag className="h-4 w-4 text-blue-500" />
                                  <span>{concern}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                              <FileText className="h-5 w-5 mr-2 text-green-500" />
                              Goals
                            </h3>
                            <div className="space-y-2">
                              {student.goals.map((goal, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2 text-sm text-gray-600 bg-white p-2 rounded-md"
                                >
                                  <Tag className="h-4 w-4 text-green-500" />
                                  <span>{goal}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Medical History */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Medical History</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-3 rounded-md">
                              <h4 className="text-sm font-medium text-gray-700">Medical Conditions</h4>
                              <p className="text-sm text-gray-600">
                                {student.medicalHistory.conditions || 'None reported'}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <h4 className="text-sm font-medium text-gray-700">Medications</h4>
                              <p className="text-sm text-gray-600">
                                {student.medicalHistory.medications || 'None reported'}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-md">
                              <h4 className="text-sm font-medium text-gray-700">Allergies</h4>
                              <p className="text-sm text-gray-600">
                                {student.medicalHistory.allergies || 'None reported'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Contact</h3>
                          <div className="bg-white p-3 rounded-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700">Name</h4>
                                <p className="text-sm text-gray-600">{student.emergencyContact.name || 'Not provided'}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700">Relationship</h4>
                                <p className="text-sm text-gray-600">{student.emergencyContact.relationship || 'Not provided'}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700">Phone Number</h4>
                                <p className="text-sm text-gray-600">
                                  {student.emergencyContact.phoneCountryCode} {student.emergencyContact.phoneNumber || 'Not provided'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Assessment Section */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                              <ClipboardCheck className="h-5 w-5 mr-2 text-purple-500" />
                              Assessment
                            </h3>
                            <Button
                              variant="outline"
                              onClick={() => student.uid && fetchAssessment(student.uid)}
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            >
                              {assessmentLoading ? 'Loading...' : 'View Assessment'}
                            </Button>
                          </div>
                        </div>

                        {showAssessmentModal && selectedAssessment && (
                          <Modal onClose={() => setShowAssessmentModal(false)}>
                            <div className="p-6 max-h-[80vh] overflow-y-auto">
                              <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Assessment</h2>
                              <div className="text-sm text-gray-500 mb-6">
                                Assessment taken on: {new Date(selectedAssessment.timestamp).toLocaleString()}
                              </div>
                              
                              <div className="space-y-6">
                                {selectedAssessment.questions.map((qa, index) => (
                                  <div key={index} className="bg-purple-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-purple-900 mb-3">
                                      {index + 1}. {qa.question}
                                    </h4>
                                    <div className="bg-white p-4 rounded-md shadow-sm">
                                      <p className="text-sm text-gray-700">{qa.answer}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Modal>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-12 text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students</h3>
              <p className="mt-1 text-sm text-gray-500">
                No students found matching your criteria.
              </p>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Students;