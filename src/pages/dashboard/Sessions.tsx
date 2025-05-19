import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { format, isBefore } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Session } from '../../types/session';
import { fetchCounselorSessions, updateSessionStatus, deleteSession } from '../../firebase/sessionsService';
import { useAuthStore } from '../../store/authStore';
import Swal from 'sweetalert2';

const Sessions: React.FC = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    if (!user?.uid) {
      setError('Please log in to view sessions');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Loading sessions for user:', user.uid);
      setLoading(true);
      setError(null);
      const fetchedSessions = await fetchCounselorSessions(user.uid);
      console.log('Fetched sessions:', fetchedSessions);
      setSessions(fetchedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (sessionId: string, newStatus: Session['status']) => {
    try {
      await updateSessionStatus(sessionId, newStatus);
      setSessions(sessions.map(session => 
        session.sessionId === sessionId 
          ? { ...session, status: newStatus }
          : session
      ));
      setExpandedSessionId(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Session ${newStatus} successfully`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error updating session status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update session status. Please try again.',
      });
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Cancel Session?',
        text: "Are you sure you want to cancel this session? This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, cancel it!'
      });

      if (result.isConfirmed) {
        await updateSessionStatus(sessionId, 'cancelled');
        setSessions(sessions.map(session => 
          session.sessionId === sessionId 
            ? { ...session, status: 'cancelled' }
            : session
        ));
        setExpandedSessionId(null);
        
        Swal.fire({
          icon: 'success',
          title: 'Cancelled!',
          text: 'The session has been cancelled.',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to cancel session. Please try again.',
      });
    }
  };

  const getSessionStatusDisplay = (session: Session) => {
    const sessionDate = new Date(session.sessionDate);
    const now = new Date();
    
    if (session.status === 'scheduled' && isBefore(sessionDate, now)) {
      return { text: 'Past', color: 'bg-red-100 text-red-800' };
    }
    
    switch (session.status) {
      case 'scheduled':
        return { text: 'Scheduled', color: 'bg-green-100 text-green-800' };
      case 'completed':
        return { text: 'Completed', color: 'bg-blue-100 text-blue-800' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
      default:
        return { text: session.status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const filteredSessions = sessions.filter(session => {
    const status = session.status.toLowerCase();
    const sessionDate = new Date(session.sessionDate);
    const now = new Date();

    if (activeTab === 'upcoming') {
      return status === 'scheduled' && !isBefore(sessionDate, now);
    }
    if (activeTab === 'past') {
      return status === 'completed' || (status === 'scheduled' && isBefore(sessionDate, now));
    }
    if (activeTab === 'cancelled') return status === 'cancelled';
    return false;
  });

  const formatSessionDate = (dateString: string) => {
    try {
      if (!dateString) return 'Date not set';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'PPP');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const formatSessionTime = (dateString: string) => {
    try {
      if (!dateString) return 'Time not set';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid time';
      return format(date, 'p');
    } catch (error) {
      console.error('Error formatting time:', dateString, error);
      return 'Invalid time';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your counseling sessions and schedule.
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadSessions}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between -mb-2">
              <div className="flex mb-2">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md mr-2 ${
                    activeTab === 'upcoming'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Upcoming
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md mr-2 ${
                    activeTab === 'past'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('past')}
                >
                  Past
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'cancelled'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading sessions...</p>
              </div>
            ) : filteredSessions.length > 0 ? (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div key={session.sessionId} className="space-y-3">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        expandedSessionId === session.sessionId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setExpandedSessionId(
                        expandedSessionId === session.sessionId ? null : session.sessionId
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {session.profilePicture ? (
                              <img
                                src={session.profilePicture}
                                alt={session.userName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">{session.userName}</h4>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="ml-1 text-xs text-gray-500">
                                {formatSessionDate(session.sessionDate)}
                              </span>
                              <Clock className="ml-3 h-4 w-4 text-gray-400" />
                              <span className="ml-1 text-xs text-gray-500">
                                {formatSessionTime(session.sessionDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getSessionStatusDisplay(session).color
                          }`}>
                            {getSessionStatusDisplay(session).text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {expandedSessionId === session.sessionId && (
                      <Card className="ml-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p className="mt-1 text-sm text-gray-900">{session.userEmail}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p className="mt-1 text-sm text-gray-900">{session.userPhone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Duration</p>
                              <p className="mt-1 text-sm text-gray-900">{session.duration} minutes</p>
                            </div>
                          </div>
                          
                          {session.userBio && (
                            <div className="pt-4 border-t border-gray-200">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <h4 className="ml-2 text-sm font-medium text-gray-900">User Bio</h4>
                              </div>
                              <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                                {session.userBio}
                              </div>
                            </div>
                          )}
                          
                          <div className="pt-4 flex justify-end space-x-3">
                            {session.status === 'scheduled' && (
                              <Button 
                                variant="outline" 
                                onClick={() => handleStatusChange(session.sessionId, 'completed')}
                              >
                                Mark as Completed
                              </Button>
                            )}
                            <Button 
                              variant="danger"
                              onClick={() => handleCancelSession(session.sessionId)}
                            >
                              Cancel Session
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any {activeTab} sessions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;