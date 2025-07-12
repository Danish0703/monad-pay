import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { config } from './config/wagmi';
import MainApp from './components/MainApp';
import PaymentPage from './components/PaymentPage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<MainApp />} />
            <Route path="/pay" element={<PaymentPage />} />
          </Routes>
          
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                borderRadius: '12px',
              },
            }}
          />
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}