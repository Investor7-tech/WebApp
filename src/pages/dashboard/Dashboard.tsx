import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  CheckCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { fetchCounselorPayments } from '../../firebase/paymentsService';
import { fetchCounselorSessions } from '../../firebase/sessionsService';
import { calculateDashboardStats } from '../../utils/statsCalculator';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { currency } = useSettingsStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeStudents: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    studentsTrend: 0,
    earningsTrend: 0,
    monthlyGoalProgress: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.uid) {
      setError('Please log in to view dashboard');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch both payments and sessions data
      const [payments, sessions] = await Promise.all([
        fetchCounselorPayments(user.uid),
        fetchCounselorSessions(user.uid)
      ]);

      // Calculate dashboard stats
      const dashboardStats = calculateDashboardStats(payments, sessions);
      setStats(dashboardStats);

      // Get upcoming sessions
      const now = new Date();
      const upcoming = sessions
        .filter(session => 
          session.status.toLowerCase() === 'scheduled' &&
          new Date(session.sessionDate) > now
        )
        .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
        .slice(0, 5);

      setUpcomingSessions(upcoming);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
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
            onClick={loadDashboardData}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back. Here's an overview of your counseling practice.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Students"
          value={stats.activeStudents}
          icon={Users}
          trend={{
            value: Math.abs(stats.studentsTrend),
            isPositive: stats.studentsTrend >= 0
          }}
          color="blue"
        />
        
        <StatCard
          title="Upcoming Sessions"
          value={stats.upcomingSessions}
          icon={Calendar}
          color="teal"
        />
        
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats.totalEarnings, currency, 'GHS')}
          icon={DollarSign}
          trend={{
            value: Math.abs(stats.earningsTrend),
            isPositive: stats.earningsTrend >= 0
          }}
          color="emerald"
        />
        
        <StatCard
          title="Completed Sessions"
          value={stats.completedSessions}
          icon={CheckCircle}
          color="blue"
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Upcoming Sessions">
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.sessionId} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{session.userName || session.email}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(session.sessionDate).toLocaleDateString()} at {new Date(session.sessionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.duration} minutes)
                  </p>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
            
            {upcomingSessions.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">No upcoming sessions</p>
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Your Progress">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-emerald-100 rounded-full p-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-gray-900">Sessions Completed</h4>
                  <p className="text-xs text-gray-500">Total number of sessions you've conducted</p>
                </div>
              </div>
              <div className="text-xl font-semibold text-gray-900">{stats.completedSessions}</div>
            </div>
            
            <div className="pt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      Monthly Goal Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {stats.monthlyGoalProgress.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div 
                    style={{ width: `${stats.monthlyGoalProgress}%` }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500 ease-in-out"
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Tips</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-blue-500">•</span>
                  <span className="ml-1">Schedule follow-up sessions within 2 weeks</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-blue-500">•</span>
                  <span className="ml-1">Send session notes within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 text-blue-500">•</span>
                  <span className="ml-1">Complete your profile to increase visibility</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;