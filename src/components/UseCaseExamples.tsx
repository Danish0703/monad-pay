import React from 'react';
import { Coffee, ShoppingBag, Music, Gift, Users, CreditCard } from 'lucide-react';

const useCases = [
  {
    icon: Coffee,
    title: 'Buy Me a Coffee',
    description: 'Creators can share payment links for tips and donations',
    example: 'monadpay://send?to=0x123...&amount=5&token=USDC&label=Coffee',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: ShoppingBag,
    title: 'E-commerce Checkout',
    description: 'One-click crypto payments for online stores',
    example: 'monadpay://send?to=0x456...&amount=29.99&token=USDC&label=T-Shirt',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Music,
    title: 'Event Tickets',
    description: 'QR codes for instant ticket purchases at events',
    example: 'monadpay://send?to=0x789...&amount=75&token=ETH&label=Concert+Ticket',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Gift,
    title: 'P2P Transfers',
    description: 'Send payment requests to friends via text or social media',
    example: 'monadpay://send?to=0xabc...&amount=20&token=USDC&label=Dinner+Split',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Users,
    title: 'Group Payments',
    description: 'Collect payments from multiple people with shared links',
    example: 'monadpay://send?to=0xdef...&amount=15&token=USDC&label=Birthday+Gift',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: CreditCard,
    title: 'Subscription Billing',
    description: 'Recurring payment links for memberships and services',
    example: 'monadpay://send?to=0x321...&amount=9.99&token=USDC&recurring=true&frequency=monthly',
    gradient: 'from-red-500 to-pink-500',
  },
];

export default function UseCaseExamples() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Real-World Use Cases
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          From creator tips to e-commerce, MonadPay enables payments everywhere
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {useCases.map((useCase, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className={`p-6 bg-gradient-to-r ${useCase.gradient}`}>
              <div className="flex items-center space-x-4 text-white">
                <div className="p-3 bg-white/20 rounded-lg">
                  <useCase.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{useCase.title}</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4 leading-relaxed">
                {useCase.description}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-2">Example Link:</p>
                <code className="text-sm font-mono text-gray-800 break-all">
                  {useCase.example}
                </code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}