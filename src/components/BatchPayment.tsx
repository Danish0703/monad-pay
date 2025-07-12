import React, { useState } from 'react';
import { Plus, Trash2, Users, Send } from 'lucide-react';
import { usePaymentContract } from '../hooks/usePaymentContract';
import { useWallet } from '../hooks/useWallet';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

interface Recipient {
  address: string;
  amount: string;
  label?: string;
}

export default function BatchPayment() {
  const [paymentHistory, setPaymentHistory] = useLocalStorage<any[]>('monadpay-history', []);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { address: '', amount: '', label: '' }
  ]);
  const [token, setToken] = useState('USDC');
  const { batchPayment, isPending } = usePaymentContract();
  const { isConnected } = useWallet();

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '', label: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const getTotalAmount = () => {
    return recipients.reduce((sum, recipient) => {
      const amount = parseFloat(recipient.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const handleBatchPayment = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const validRecipients = recipients.filter(r => r.address && r.amount);
    
    if (validRecipients.length === 0) {
      toast.error('Please add at least one valid recipient');
      return;
    }

    try {
      // Add to history
      const historyItem = {
        id: Date.now().toString(),
        request: {
          to: `${validRecipients.length} recipients`,
          amount: getTotalAmount().toString(),
          token,
          label: `Batch payment to ${validRecipients.length} recipients`,
        },
        url: '',
        qrCode: '',
        createdAt: new Date().toISOString(),
        status: 'pending',
        type: 'sent',
        clickCount: 0,
      };
      
      setPaymentHistory([historyItem, ...paymentHistory]);
      
      const addresses = validRecipients.map(r => r.address);
      const amounts = validRecipients.map(r => r.amount);
      
      await batchPayment(addresses, amounts, token);
      
      // Update to completed
      const updatedHistory = paymentHistory.map(item => 
        item.id === historyItem.id 
          ? { ...item, status: 'completed' }
          : item
      );
      setPaymentHistory([historyItem, ...updatedHistory]);
      
      toast.success('Batch payment initiated!');
    } catch (error) {
      // Update to failed
      const updatedHistory = paymentHistory.map(item => 
        item.id === Date.now().toString() 
          ? { ...item, status: 'failed' }
          : item
      );
      setPaymentHistory(updatedHistory);
      
      toast.error('Failed to execute batch payment');
      console.error('Batch payment error:', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Users className="h-5 w-5 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Batch Payment</h2>
      </div>

      <div className="space-y-4">
        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token
          </label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          >
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
            <option value="ETH">ETH</option>
            <option value="MON">MON</option>
          </select>
        </div>

        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients
          </label>
          <div className="space-y-3">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="0x1234567890abcdef..."
                    value={recipient.address}
                    onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={recipient.amount}
                    onChange={(e) => updateRecipient(index, 'amount', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Label (optional)"
                    value={recipient.label}
                    onChange={(e) => updateRecipient(index, 'label', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                
                {recipients.length > 1 && (
                  <button
                    onClick={() => removeRecipient(index)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Recipient Button */}
        <button
          onClick={addRecipient}
          className="flex items-center space-x-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Recipient</span>
        </button>

        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Recipients:</span>
            <span className="font-medium">{recipients.filter(r => r.address && r.amount).length}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="font-medium text-lg">{getTotalAmount().toFixed(4)} {token}</span>
          </div>
        </div>

        {/* Execute Button */}
        <button
          onClick={handleBatchPayment}
          disabled={isPending || !isConnected || recipients.filter(r => r.address && r.amount).length === 0}
          className={cn(
            "w-full py-3 px-6 rounded-lg font-medium transition-all",
            "bg-gradient-to-r from-green-600 to-emerald-600 text-white",
            "hover:from-green-700 hover:to-emerald-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center space-x-2"
          )}
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>Execute Batch Payment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}