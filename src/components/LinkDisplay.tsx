import React, { useState } from 'react';
import { Copy, QrCode, ExternalLink, CheckCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PaymentRequest } from '../types';
import { generateFallbackLink } from '../utils/link-parser';
import NFCWriter from './NFCWriter';
import { cn } from '../utils/cn';

interface Props {
  link: string;
  qrCode: string;
  request: PaymentRequest;
}

export default function LinkDisplay({ link, qrCode, request }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);
  
  const fallbackLink = generateFallbackLink(request);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MonadPay Payment Request',
          text: `Payment request for ${request.amount} ${request.token}`,
          url: fallbackLink,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard(fallbackLink);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Payment Link Generated</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowQR(!showQR)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <QrCode className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-semibold text-lg">{request.amount} {request.token}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Recipient</p>
            <p className="font-mono text-sm truncate">{request.to}</p>
          </div>
          {request.label && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Label</p>
              <p className="font-medium">{request.label}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* QR Code */}
      {showQR && (
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <img src={qrCode} alt="Payment QR Code" className="w-48 h-48" />
          </div>
        </div>
      )}
      
      {/* Deep Link */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deep Link (for wallet apps)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={link}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(link)}
              className="p-3 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {/* Fallback Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Web Link (fallback)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={fallbackLink}
              readOnly
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(fallbackLink)}
              className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* NFC Writer */}
      <div className="mb-6">
        <NFCWriter paymentUrl={link} label={request.label} />
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          onClick={() => window.open(`/pay?${new URLSearchParams({
            to: request.to,
            amount: request.amount,
            token: request.token || 'MON',
            ...(request.label && { label: request.label }),
            ...(request.memo && { memo: request.memo })
          }).toString()}`, '_blank')}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Test Payment Page</span>
        </button>
        
        <button
          onClick={shareLink}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Payment Link</span>
        </button>
      </div>
    </div>
  );
}