import React from 'react';
import { Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

export default function WalletConnect() {
  const { address, isConnected, balance, chain, connect, disconnect } = useWallet();

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance: any) => {
    if (!balance) return '0';
    return parseFloat(balance.formatted).toFixed(4);
  };

  const handleConnect = () => {
    try {
      connect();
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };
  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
      >
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">
              {formatAddress(address!)}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            {formatBalance(balance)} {balance?.symbol}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={copyAddress}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy address"
            >
              <Copy className="h-3 w-3" />
            </button>
            
            {chain && (
              <a
                href={`${chain.blockExplorers?.default?.url}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => disconnect()}
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        title="Disconnect wallet"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}