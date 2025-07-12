import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { usePaymentContract } from '../hooks/usePaymentContract';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PaymentRequest } from '../types';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentHistory, setPaymentHistory] = useLocalStorage<any[]>('monadpay-history', []);
  
  const { isConnected, connect, address } = useWallet();
  const { executePayment, isPending } = usePaymentContract();

  useEffect(() => {
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');
    const token = searchParams.get('token');
    const label = searchParams.get('label');
    const memo = searchParams.get('memo');

    if (to && amount) {
      setPaymentRequest({
        to,
        amount,
        token: token || 'MON',
        label: label || undefined,
        memo: memo || undefined,
      });
    }
  }, [searchParams]);

  const handlePayment = async () => {
    if (!paymentRequest || !isConnected) return;

    setIsProcessing(true);
    try {
      // Add to history as pending
      const historyItem = {
        id: Date.now().toString(),
        request: paymentRequest,
        url: window.location.href,
        qrCode: '',
        createdAt: new Date().toISOString(),
        status: 'pending',
        type: 'sent',
        clickCount: 0,
        txHash: undefined,
      };
      
      setPaymentHistory([historyItem, ...paymentHistory]);
      
      // In a real implementation, this would create and execute the payment
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      
      // Update status to completed
      const updatedHistory = paymentHistory.map(item => 
        item.id === historyItem.id 
          ? { ...item, status: 'completed', txHash: '0x' + Math.random().toString(16).substr(2, 64) }
          : item
      );
      setPaymentHistory([historyItem, ...updatedHistory]);
      
      setPaymentComplete(true);
      toast.success('Payment completed successfully!');
    } catch (error) {
      // Update status to failed
      const updatedHistory = paymentHistory.map(item => 
        item.id === Date.now().toString() 
          ? { ...item, status: 'failed' }
          : item
      );
      setPaymentHistory(updatedHistory);
      
      toast.error('Payment failed');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!paymentRequest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Payment Link</h1>
          <p className="text-gray-600 mb-6">The payment link appears to be malformed or missing required parameters.</p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to MonadPay</span>
          </a>
        </div>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your payment of {paymentRequest.amount} {paymentRequest.token} has been sent successfully.
          </p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to MonadPay</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="p-3 bg-purple-100 rounded-full inline-block mb-4">
            <Wallet className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Request</h1>
          <p className="text-gray-600">Complete this payment using your wallet</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <span className="text-2xl font-bold text-gray-900">
                {paymentRequest.amount} {paymentRequest.token}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">To</span>
              <span className="font-mono text-sm text-gray-900">
                {paymentRequest.to.slice(0, 6)}...{paymentRequest.to.slice(-4)}
              </span>
            </div>

            {paymentRequest.label && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Label</span>
                <span className="text-gray-900">{paymentRequest.label}</span>
              </div>
            )}

            {paymentRequest.memo && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-600 text-sm">Memo</span>
                <p className="text-gray-900 mt-1">{paymentRequest.memo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Wallet Connection */}
        {!isConnected ? (
          <button
            onClick={connect}
            className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            <Wallet className="h-5 w-5" />
            <span>Connect Wallet to Pay</span>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 py-2 px-4 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={cn(
                "w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-lg font-medium transition-all",
                "bg-gradient-to-r from-green-600 to-emerald-600 text-white",
                "hover:from-green-700 hover:to-emerald-700",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-5 w-5" />
                  <span>Pay {paymentRequest.amount} {paymentRequest.token}</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-purple-600 hover:text-purple-700 text-sm transition-colors"
          >
            ← Back to MonadPay
          </a>
        </div>
      </div>
    </div>
  );
}