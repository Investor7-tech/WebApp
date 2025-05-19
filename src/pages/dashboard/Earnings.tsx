import React, { useState, useRef, useEffect } from 'react';
import { DollarSign, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import Card from '../../components/ui/Card';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { fetchCounselorPayments, calculateEarningsStats, Payment } from '../../firebase/paymentsService';

// Register ChartJS components and plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

const Earnings: React.FC = () => {
  const { user } = useAuthStore();
  const { currency } = useSettingsStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Payment;
    direction: 'asc' | 'desc';
  }>({ key: 'paymentDate', direction: 'desc' });

  const chartRef = useRef<ChartJS<'line'>>(null);

  useEffect(() => {
    loadPayments();
  }, [user]);

  const loadPayments = async () => {
    if (!user?.uid) {
      setError('Please log in to view earnings');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedPayments = await fetchCounselorPayments(user.uid);
      setPayments(fetchedPayments);
      setError(null);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, originalCurrency: string) => {
    return formatCurrency(amount, currency, originalCurrency);
  };

  // Prepare data for the chart
  const monthlyEarnings = Array(12).fill(0);
  payments.forEach(payment => {
    if (new Date(payment.paymentDate).getFullYear().toString() === selectedYear && 
        payment.paymentStatus === 'completed') {
      const month = new Date(payment.paymentDate).getMonth();
      monthlyEarnings[month] += payment.amount;
    }
  });

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Earnings',
        data: monthlyEarnings,
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBackgroundColor: 'white',
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: 'rgb(59, 130, 246)',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: 'easeInQuart' as const,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Earnings Overview ${selectedYear}`,
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x' as const,
        },
        pan: {
          enabled: true,
          mode: 'x' as const,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            return formatAmount(context.parsed.y, payments[0]?.currency || 'GHS');
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: number | string) {
            return formatAmount(Number(value), payments[0]?.currency || 'GHS');
          },
        },
      },
      x: {
        type: 'category' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      }
    },
  };

  const sortedPayments = [...payments].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key: keyof Payment) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const stats = calculateEarningsStats(payments);

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
            onClick={loadPayments}
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
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your counseling revenue and payment history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-700 to-blue-800 text-white transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-base font-semibold text-white tracking-wide">Total Earnings</p>
              <p className="text-3xl lg:text-4xl font-bold mt-2 tracking-tight text-white">
                {formatAmount(stats.totalEarnings, payments[0]?.currency || 'GHS')}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm font-medium text-white">
            {stats.earningsTrend.isPositive ? (
              <span className="flex items-center">
                <span className="text-green-300 mr-1">↑</span>
                <span className="text-white">{stats.earningsTrend.value.toFixed(1)}% from last month</span>
              </span>
            ) : (
              <span className="flex items-center">
                <span className="text-red-300 mr-1">↓</span>
                <span className="text-white">{stats.earningsTrend.value.toFixed(1)}% from last month</span>
              </span>
            )}
          </div>
        </Card>

        <Card className="transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-full">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatAmount(stats.pendingAmount, payments[0]?.currency || 'GHS')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {formatAmount(stats.failedAmount, payments[0]?.currency || 'GHS')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Earnings Overview</h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="ml-4 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="h-80">
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('paymentDate')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'paymentDate' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4 ml-1" /> : 
                        <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'amount' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4 ml-1" /> : 
                        <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('paymentStatus')}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig.key === 'paymentStatus' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronUp className="h-4 w-4 ml-1" /> : 
                        <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPayments.map((payment) => (
                <tr key={payment.paymentId} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(payment.amount, payment.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.paymentStatus === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : payment.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Earnings;