import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from './config';

export interface Payment {
  amount: number;
  amountPaid: number;
  channel: string;
  counsellorId: string;
  counselorName: string;
  currency: string;
  email: string;
  paymentDate: string;
  paymentId: string;
  paymentStatus: string;
  reference: string;
  sessionId: string;
  status: string;
  timestamp: string;
  userId: string;
}

export const fetchCounselorPayments = async (counselorId: string): Promise<Payment[]> => {
  try {
    const paymentsRef = collection(firestore, 'payments');
    const q = query(
      paymentsRef, 
      where('counsellorId', '==', counselorId),
      orderBy('paymentDate', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() } as Payment));
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

export const calculateEarningsStats = (payments: Payment[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const completedPayments = payments.filter(p => p.paymentStatus === 'completed');
  const pendingPayments = payments.filter(p => p.paymentStatus === 'pending');
  const failedPayments = payments.filter(p => p.status === 'failed');

  // Calculate total earnings
  const totalEarnings = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const failedAmount = failedPayments.reduce((sum, p) => sum + p.amount, 0);

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
  const earningsTrend = lastMonthEarnings === 0 ? 100 :
    ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;

  return {
    totalEarnings,
    pendingAmount,
    failedAmount,
    thisMonthEarnings,
    lastMonthEarnings,
    earningsTrend: {
      value: Math.abs(earningsTrend),
      isPositive: earningsTrend >= 0
    }
  };
};