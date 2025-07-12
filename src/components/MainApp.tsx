import React, { useState } from 'react';
import Header from './Header';
import LinkGenerator from './LinkGenerator';
import LinkDisplay from './LinkDisplay';
import PaymentParser from './PaymentParser';
import PaymentHistory from './PaymentHistory';
import BatchPayment from './BatchPayment';
import RecurringPayments from './RecurringPayments';
import FeatureShowcase from './FeatureShowcase';
import UseCaseExamples from './UseCaseExamples';
import { PaymentRequest } from '../types';

export default function MainApp() {
  const [generatedLink, setGeneratedLink] = useState<{
    link: string;
    qrCode: string;
    request: PaymentRequest;
  } | null>(null);
  
  const [activeTab, setActiveTab] = useState<'generate' | 'parse' | 'batch' | 'recurring' | 'history' | 'examples'>('generate');

  const handleLinkGenerated = (link: string, qrCode: string, request: PaymentRequest) => {
    setGeneratedLink({ link, qrCode, request });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>⚡</span>
            <span>Now supporting Monad testnet</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MonadPay
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The easiest way to send, request, and trigger crypto payments — with just a link.
            Embed payments anywhere: social media, QR codes, NFC chips, or invoices.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-200 overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              {[
                { id: 'generate', label: 'Generate' },
                { id: 'parse', label: 'Parse' },
                { id: 'batch', label: 'Batch' },
                { id: 'recurring', label: 'Recurring' },
                { id: 'history', label: 'History' },
                { id: 'examples', label: 'Examples' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content Sections */}
        {activeTab === 'generate' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <LinkGenerator onLinkGenerated={handleLinkGenerated} />
              {generatedLink && (
                <LinkDisplay
                  link={generatedLink.link}
                  qrCode={generatedLink.qrCode}
                  request={generatedLink.request}
                />
              )}
            </div>
            
            {!generatedLink && (
              <div className="lg:col-span-2">
                <FeatureShowcase />
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'parse' && (
          <div className="max-w-4xl mx-auto">
            <PaymentParser />
          </div>
        )}
        
        {activeTab === 'batch' && (
          <div className="max-w-4xl mx-auto">
            <BatchPayment />
          </div>
        )}
        
        {activeTab === 'recurring' && (
          <div className="max-w-4xl mx-auto">
            <RecurringPayments />
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <PaymentHistory />
          </div>
        )}
        
        {activeTab === 'examples' && (
          <div>
            <UseCaseExamples />
          </div>
        )}
      </main>
    </div>
  );
}