import React, { useState } from 'react';
import { Calendar, Repeat, Clock, Pause, Play } from 'lucide-react';
import { usePaymentContract } from '../hooks/usePaymentContract';
import { useWallet } from '../hooks/useWallet';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

interface RecurringPayment {
  to: string;
  amount: string;
  token: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  label: string;
  nextPayment: Date;
  active: boolean;
}

export default function RecurringPayments() {
  const [newPayment, setNewPayment] = useState({
    to: '',
    amount: '',
    token: 'USDC',
    frequency: 'monthly' as const,
    label: '',
  });
  
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const { createRecurringPayment, isPending } = usePaymentContract();
  const { isConnected } = useWallet();

  const frequencyToSeconds = {
    daily: 86400,
    weekly: 604800,
    monthly: 2592000,
  };

  const handleCreateRecurring = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!newPayment.to || !newPayment.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const frequency = frequencyToSeconds[newPayment.frequency];
      await createRecurringPayment({ ...newPayment, frequency });
      
      // Add to local state (in real app, this would come from contract events)
      const nextPayment = new Date();
      nextPayment.setSeconds(nextPayment.getSeconds() + frequency);
      
      setRecurringPayments([...recurringPayments, {
        ...newPayment,
        nextPayment,
        active: true,
      }]);
      
      setNewPayment({
        to: '',
        amount: '',
        token: 'USDC',
        frequency: 'monthly',
        label: '',
      });
      
      toast.success('Recurring payment created!');
    } catch (error) {
      toast.error('Failed to create recurring payment');
      console.error('Recurring payment error:', error);
    }
  };

  const togglePayment = (index: number) => {
    const updated = [...recurringPayments];
    updated[index].active = !updated[index].active;
    setRecurringPayments(updated);
  };

  const getFrequencyLabel = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  const formatNextPayment = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Create New Recurring Payment */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Repeat className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Create Recurring Payment</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="0x1234567890abcdef..."
              value={newPayment.to}
              onChange={(e) => setNewPayment({ ...newPayment, to: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              placeholder="10.5"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token
            </label>
            <select
              value={newPayment.token}
              onChange={(e) => setNewPayment({ ...newPayment, token: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
              <option value="ETH">ETH</option>
              <option value="MON">MON</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={newPayment.frequency}
              onChange={(e) => setNewPayment({ ...newPayment, frequency: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label
            </label>
            <input
              type="text"
              placeholder="Netflix subscription"
              value={newPayment.label}
              onChange={(e) => setNewPayment({ ...newPayment, label: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleCreateRecurring}
          disabled={isPending || !isConnected || !newPayment.to || !newPayment.amount}
          className={cn(
            "w-full mt-6 py-3 px-6 rounded-lg font-medium transition-all",
            "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
            "hover:from-purple-700 hover:to-blue-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center space-x-2"
          )}
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              <span>Create Recurring Payment</span>
            </>
          )}
        </button>
      </div>

      {/* Active Recurring Payments */}
      {recurringPayments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Recurring Payments</h3>
          
          <div className="space-y-4">
            {recurringPayments.map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    payment.active ? "bg-green-100" : "bg-gray-100"
                  )}>
                    <Clock className={cn(
                      "h-4 w-4",
                      payment.active ? "text-green-600" : "text-gray-400"
                    )} />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {payment.amount} {payment.token}
                      </p>
                      <span className="text-sm text-gray-500">• {getFrequencyLabel(payment.frequency)}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      To: {payment.to.slice(0, 10)}...
                    </p>
                    {payment.label && (
                      <p className="text-sm text-gray-600">{payment.label}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Next payment: {formatNextPayment(payment.nextPayment)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => togglePayment(index)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    payment.active
                      ? "text-red-600 hover:bg-red-50"
                      : "text-green-600 hover:bg-green-50"
                  )}
                >
                  {payment.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}