import React from 'react';
import { Clock, ExternalLink, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { GeneratedLink } from '../types';
import { cn } from '../utils/cn';

interface PaymentHistoryItem extends GeneratedLink {
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  type: 'sent' | 'received' | 'created';
}

export default function PaymentHistory() {
  const [paymentHistory] = useLocalStorage<PaymentHistoryItem[]>('monadpay-history', []);

  // Add some demo data if history is empty
  const [, setPaymentHistory] = useLocalStorage<PaymentHistoryItem[]>('monadpay-history', []);
  
  React.useEffect(() => {
    if (paymentHistory.length === 0) {
      const demoData = [
        {
          id: '1',
          request: {
            to: '0xE6A3987D26E37c8F96d473aD8dF523A834276674',
            amount: '19',
            token: 'MON',
            label: 'Test Payment'
          },
          url: '',
          qrCode: '',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'completed' as const,
          type: 'created' as const,
          clickCount: 3,
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        }
      ];
      setPaymentHistory(demoData);
    }
  }, [paymentHistory.length, setPaymentHistory]);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'received':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      default:
        return <ExternalLink className="h-4 w-4 text-blue-500" />;
    }
  };

  if (paymentHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment History</h2>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No payment history yet</p>
          <p className="text-sm text-gray-400">Your transactions will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment History</h2>
      
      <div className="space-y-4">
        {paymentHistory.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getTypeIcon(item.type)}
                {getStatusIcon(item.status)}
              </div>
              
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">
                    {item.request.amount} {item.request.token}
                  </p>
                  {item.request.label && (
                    <span className="text-sm text-gray-500">• {item.request.label}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {item.type === 'sent' ? 'To: ' : item.type === 'received' ? 'From: ' : 'Created: '}
                  {item.request.to.slice(0, 10)}...
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()} at{' '}
                  {new Date(item.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                item.status === 'completed' && "bg-green-100 text-green-800",
                item.status === 'pending' && "bg-yellow-100 text-yellow-800",
                item.status === 'failed' && "bg-red-100 text-red-800"
              )}>
                {item.status}
              </span>
              
              {item.txHash && (
                <a
                  href={`https://testnet-explorer.monad.xyz/tx/${item.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}