import React, { useState } from 'react';
import { Nfc, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';
import { useNFC } from '../hooks/useNFC';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

interface Props {
  paymentUrl: string;
  label?: string;
}

export default function NFCWriter({ paymentUrl, label }: Props) {
  const { isSupported, isWriting, writeNFC } = useNFC();
  const [writeStatus, setWriteStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleWriteNFC = async () => {
    try {
      setWriteStatus('idle');
      await writeNFC({ url: paymentUrl, label });
      setWriteStatus('success');
      toast.success('NFC tag written successfully!');
    } catch (error) {
      setWriteStatus('error');
      toast.error('Failed to write NFC tag');
      console.error('NFC write error:', error);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <Smartphone className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">NFC Not Supported</p>
            <p className="text-xs text-gray-500">Your device doesn't support NFC writing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Nfc className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Write to NFC Tag</h3>
            <p className="text-sm text-gray-500">Tap to write payment link to NFC chip</p>
          </div>
        </div>
        
        {writeStatus === 'success' && (
          <CheckCircle className="h-5 w-5 text-green-500" />
        )}
        {writeStatus === 'error' && (
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      
      <button
        onClick={handleWriteNFC}
        disabled={isWriting}
        className={cn(
          "w-full py-3 px-4 rounded-lg font-medium transition-all",
          "bg-blue-600 text-white hover:bg-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-center space-x-2"
        )}
      >
        {isWriting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>Writing to NFC...</span>
          </>
        ) : (
          <>
            <Nfc className="h-4 w-4" />
            <span>Write to NFC Tag</span>
          </>
        )}
      </button>
      
      {writeStatus === 'success' && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            NFC tag written successfully! Tap the tag with any NFC-enabled device to trigger the payment.
          </p>
        </div>
      )}
      
      {writeStatus === 'error' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Failed to write NFC tag. Make sure you have an NFC tag nearby and try again.
          </p>
        </div>
      )}
    </div>
  );
}