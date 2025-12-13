'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle2, XCircle, Clock, CreditCard, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Payment {
  id: string;
  user_id: string;
  user_email: string;
  amount: number;
  payment_status: string;
  payment_method: string;
  order_id: string;
  created_at: string;
}

export function AdminPaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Get access token from Supabase
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch('/api/admin/payments', {
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error('Unauthorized: You do not have admin permissions');
          setPayments([]);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setPayments(result.payments || []);
        if (!result.payments || result.payments.length === 0) {
          console.warn('No payments found in response');
        }
      } else {
        console.error('Failed to fetch payments:', result.error);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments. Please check your connection.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'failed':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30">
            {status}
          </span>
        );
    }
  };

  const completedPayments = payments.filter(
    (p) => p.payment_status === 'completed' || p.payment_status === 'success'
  );
  const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount / 100), 0);
  const pendingPayments = payments.filter((p) => p.payment_status === 'pending').length;

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      name: 'Total Payments',
      value: payments.length.toString(),
      icon: CreditCard,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Pending',
      value: pendingPayments.toString(),
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      name: 'Success Rate',
      value: payments.length > 0
        ? `${Math.round((completedPayments.length / payments.length) * 100)}%`
        : '0%',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-dashboard-elevated border border-dashboard-border rounded-xl p-6 overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-400">{stat.name}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Payments Table */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Payment Transactions</h2>
          <p className="text-sm text-slate-400 mt-1">All payment records and transactions</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
            <p className="text-slate-400 mt-4">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dashboard-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-dashboard-border hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="text-white font-mono text-sm">{payment.order_id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white">{payment.user_email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white font-semibold">
                        ${((payment.amount || 0) / 100).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-400">{payment.payment_method || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(payment.payment_status)}</td>
                    <td className="py-4 px-4">
                      <span className="text-slate-400 text-sm">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
