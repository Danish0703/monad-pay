import React from 'react';
import { QrCode, Link, Smartphone, Zap, Shield, Globe } from 'lucide-react';

const features = [
  {
    icon: Link,
    title: 'URL-Native Payments',
    description: 'Embed payment requests directly in URLs. Share anywhere, trigger payments instantly.',
    color: 'purple',
  },
  {
    icon: QrCode,
    title: 'QR & NFC Ready',
    description: 'Generate QR codes and NFC-compatible links for offline payment experiences.',
    color: 'blue',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First',
    description: 'Optimized for mobile wallets with deep linking and seamless UX flows.',
    color: 'green',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on Monad for ultra-fast, low-cost transactions with instant settlement.',
    color: 'yellow',
  },
  {
    icon: Shield,
    title: 'Secure by Design',
    description: 'Non-custodial, wallet-controlled transactions. Your keys, your crypto.',
    color: 'red',
  },
  {
    icon: Globe,
    title: 'Universal Support',
    description: 'Works with any EVM wallet, multiple tokens, and fallback web interface.',
    color: 'indigo',
  },
];

const colorClasses = {
  purple: 'bg-purple-100 text-purple-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
  indigo: 'bg-indigo-100 text-indigo-600',
};

export default function FeatureShowcase() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Payments that fit in a URL. Literally.
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Post it, text it, NFC it. Every MonadPay link is a transaction waiting to happen.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className={`p-3 rounded-lg inline-block mb-4 ${colorClasses[feature.color]}`}>
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}