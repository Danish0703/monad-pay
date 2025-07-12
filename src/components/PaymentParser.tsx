import React, { useState } from 'react';
import { Search, AlertCircle, Wallet } from 'lucide-react';
import { PaymentRequest } from '../types';
import { parsePaymentLink } from '../utils/link-parser';
import { cn } from '../utils/cn';

export default function PaymentParser() {
  const [inputUrl, setInputUrl] = useState('');
  const [parsedRequest, setParsedRequest] = useState<PaymentRequest | null>(null);
  const [error, setError] = useState('');

  const handleParse = () => {
    setError('');
    setParsedRequest(null);
    
    if (!inputUrl.trim()) {
      setError('Please enter a payment link');
      return;
    }
    
    const parsed = parsePaymentLink(inputUrl.trim());
    
    if (parsed) {
      setParsedRequest(parsed);
    } else {
      setError('Invalid payment link format');
    }
  };

  const handleConnect = () => {
    // This would integrate with WalletConnect
    alert('Wallet connection would be implemented here');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Search className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Parse Payment Link</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="monadpay://send?to=0x123...&amount=10&token=USDC"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleParse}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Parse
            </button>
          </div>
        </div>
        
        {error && (
          <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {parsedRequest && (
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Request Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Recipient</p>
                <p className="font-mono text-sm bg-white px-3 py-2 rounded border truncate">
                  {parsedRequest.to}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {parsedRequest.amount} {parsedRequest.token || 'ETH'}
                </p>
              </div>
              
              {parsedRequest.label && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Label</p>
                  <p className="font-medium">{parsedRequest.label}</p>
                </div>
              )}
              
              {parsedRequest.memo && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Memo</p>
                  <p className="text-gray-800">{parsedRequest.memo}</p>
                </div>
              )}
              
              {parsedRequest.expires && (
                <div>
                  <p className="text-sm text-gray-600">Expires</p>
                  <p className="text-gray-800">
                    {new Date(parsedRequest.expires).toLocaleString()}
                  </p>
                </div>
              )}
              
              {parsedRequest.recurring && (
                <div>
                  <p className="text-sm text-gray-600">Recurring</p>
                  <p className="text-gray-800 capitalize">
                    {parsedRequest.frequency || 'One-time'}
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleConnect}
              className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet & Pay</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}