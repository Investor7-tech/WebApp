import { Payment } from '../firebase/paymentsService';

export interface DashboardStats {
  totalEarnings: number;
  activeStudents: number;
  upcomingSessions: number;
  completedSessions: number;
  studentsTrend: number;
  earningsTrend: number;
  monthlyGoalProgress: number;
}

export const calculateDashboardStats = (
  payments: Payment[],
  sessions: any[]
): DashboardStats => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate total earnings from completed payments
  const completedPayments = payments.filter(p => p.paymentStatus === 'completed');
  const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate this month's earnings
  const thisMonthEarnings = completedPayments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  // Calculate last month's earnings
  const lastMonthDate = new Date(currentYear, currentMonth - 1);
  const lastMonthEarnings = completedPayments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getMonth() === lastMonthDate.getMonth() && 
             paymentDate.getFullYear() === lastMonthDate.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  // Calculate earnings trend
  const earningsTrend = lastMonthEarnings === 0 ? 0 :
    ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;

  // Get unique students from all sessions
  const uniqueStudentIds = new Set(sessions.map(session => session.userId));
  const activeStudents = uniqueStudentIds.size;

  // Calculate students trend (comparing this month's new students to last month's)
  const thisMonthStudents = new Set(
    sessions
      .filter(session => {
        const sessionDate = new Date(session.sessionDate);
        return sessionDate.getMonth() === currentMonth && 
               sessionDate.getFullYear() === currentYear;
      })
      .map(session => session.userId)
  ).size;

  const lastMonthStudents = new Set(
    sessions
      .filter(session => {
        const sessionDate = new Date(session.sessionDate);
        return sessionDate.getMonth() === lastMonthDate.getMonth() && 
               sessionDate.getFullYear() === lastMonthDate.getFullYear();
      })
      .map(session => session.userId)
  ).size;

  const studentsTrend = lastMonthStudents === 0 ? 0 :
    ((thisMonthStudents - lastMonthStudents) / lastMonthStudents) * 100;

  // Get upcoming sessions count
  const upcomingSessions = sessions.filter(session => 
    session.status.toLowerCase() === 'scheduled' &&
    new Date(session.sessionDate) > now
  ).length;

  // Get completed sessions count
  const completedSessions = sessions.filter(session => 
    session.status.toLowerCase() === 'completed'
  ).length;

  // Calculate monthly goal progress (assuming goal is 20 sessions per month)
  const monthlyGoal = 20;
  const thisMonthCompletedSessions = sessions.filter(session => {
    const sessionDate = new Date(session.sessionDate);
    return session.status.toLowerCase() === 'completed' &&
           sessionDate.getMonth() === currentMonth && 
           sessionDate.getFullYear() === currentYear;
  }).length;

  const monthlyGoalProgress = (thisMonthCompletedSessions / monthlyGoal) * 100;

  return {
    totalEarnings,
    activeStudents,
    upcomingSessions,
    completedSessions,
    studentsTrend,
    earningsTrend,
    monthlyGoalProgress: Math.min(monthlyGoalProgress, 100), // Cap at 100%
  };
};