import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config } from '../config/wagmi';

// Global Web3Modal instance
let web3Modal: any = null;

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { data: balance } = useBalance({
    address,
  });

  const connectWallet = async () => {
    console.log('Connect wallet clicked');
    
    const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
    console.log('Project ID:', projectId);
    
    if (projectId && !web3Modal) {
      try {
        console.log('Creating Web3Modal...');
        web3Modal = createWeb3Modal({
          wagmiConfig: config,
          projectId,
          enableAnalytics: true,
          themeMode: 'light',
          themeVariables: {
            '--w3m-accent': '#7c3aed',
            '--w3m-border-radius-master': '12px',
          },
        });
        console.log('Web3Modal created successfully:', web3Modal);
      } catch (error) {
        console.error('Failed to create Web3Modal:', error);
      }
    }
    
    if (web3Modal) {
      try {
        console.log('Opening Web3Modal...');
        await web3Modal.open();
        console.log('Web3Modal opened');
        return;
      } catch (error) {
        console.error('Error opening Web3Modal:', error);
      }
    }
    
    // Fallback to direct connector
    console.log('Falling back to direct connector');
    console.log('Available connectors:', connectors);
    
    if (connectors.length > 0) {
      try {
        console.log('Using connector:', connectors[0]);
        await connect({ connector: connectors[0] });
        console.log('Connected via direct connector');
      } catch (error) {
        console.error('Direct connector failed:', error);
      }
    } else {
      console.error('No connectors available');
    }
  };

  return {
    address,
    isConnected,
    chain,
    balance,
    connect: connectWallet,
    disconnect,
    connectors,
  };
}