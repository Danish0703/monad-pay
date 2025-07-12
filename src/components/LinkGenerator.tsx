import React, { useState } from 'react';
import { Copy, QrCode, Share2, ExternalLink, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { PaymentRequest } from '../types';
import { generatePaymentLink, generateFallbackLink, isValidAddress, isValidAmount } from '../utils/link-parser';
import { generateQRCode } from '../utils/qr-generator';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { cn } from '../utils/cn';

interface Props {
  onLinkGenerated: (link: string, qrCode: string, request: PaymentRequest) => void;
}

export default function LinkGenerator({ onLinkGenerated }: Props) {
  const [paymentHistory, setPaymentHistory] = useLocalStorage<any[]>('monadpay-history', []);
  const [request, setRequest] = useState<PaymentRequest>({
    to: '',
    amount: '',
    token: 'USDC',
    label: '',
    memo: '',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = async () => {
    if (!isValidAddress(request.to)) {
      toast.error('Please enter a valid wallet address');
      return;
    }
    
    if (!isValidAmount(request.amount)) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const link = generatePaymentLink(request);
      const qrCode = await generateQRCode(link);
      
      // Save to history
      const historyItem = {
        id: Date.now().toString(),
        request,
        url: link,
        qrCode,
        createdAt: new Date().toISOString(),
        status: 'created',
        type: 'created',
        clickCount: 0,
      };
      
      setPaymentHistory([historyItem, ...paymentHistory]);
      
      onLinkGenerated(link, qrCode, request);
      toast.success('Payment link generated successfully!');
    } catch (error) {
      toast.error('Failed to generate payment link');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <QrCode className="h-5 w-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Create Payment Link</h2>
      </div>
      
      <div className="space-y-4">
        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="0x1234567890abcdef..."
            value={request.to}
            onChange={(e) => setRequest({ ...request, to: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        
        {/* Amount and Token */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              placeholder="10.5"
              value={request.amount}
              onChange={(e) => setRequest({ ...request, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token
            </label>
            <select
              value={request.token}
              onChange={(e) => setRequest({ ...request, token: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
              <option value="ETH">ETH</option>
              <option value="MON">MON</option>
            </select>
          </div>
        </div>
        
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Label (optional)
          </label>
          <input
            type="text"
            placeholder="Coffee payment"
            value={request.label}
            onChange={(e) => setRequest({ ...request, label: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
        
        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>
        
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Memo (optional)
              </label>
              <textarea
                placeholder="Additional notes or reference..."
                value={request.memo}
                onChange={(e) => setRequest({ ...request, memo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires (optional)
              </label>
              <input
                type="datetime-local"
                value={request.expires}
                onChange={(e) => setRequest({ ...request, expires: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !request.to || !request.amount}
          className={cn(
            "w-full py-3 px-6 rounded-lg font-medium transition-all",
            "bg-gradient-to-r from-purple-600 to-blue-600 text-white",
            "hover:from-purple-700 hover:to-blue-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center space-x-2"
          )}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              <span>Generate Payment Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}