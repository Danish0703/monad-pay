import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { PaymentRequest } from '../types';

const PAYMENT_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // Replace with deployed contract
const PAYMENT_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "address", "name": "_token", "type": "address"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"},
      {"internalType": "string", "name": "_label", "type": "string"},
      {"internalType": "string", "name": "_memo", "type": "string"}
    ],
    "name": "createPayment",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "_paymentId", "type": "bytes32"}],
    "name": "executePayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "address", "name": "_token", "type": "address"},
      {"internalType": "uint256", "name": "_amount", "type": "uint256"},
      {"internalType": "uint256", "name": "_frequency", "type": "uint256"},
      {"internalType": "string", "name": "_label", "type": "string"}
    ],
    "name": "createRecurringPayment",
    "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address[]", "name": "_recipients", "type": "address[]"},
      {"internalType": "address", "name": "_token", "type": "address"},
      {"internalType": "uint256[]", "name": "_amounts", "type": "uint256[]"}
    ],
    "name": "batchPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

export function usePaymentContract() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createPayment = async (request: PaymentRequest) => {
    const amount = parseEther(request.amount);
    
    return writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PAYMENT_CONTRACT_ABI,
      functionName: 'createPayment',
      args: [
        request.to,
        request.token === 'ETH' ? '0x0000000000000000000000000000000000000000' : request.token,
        amount,
        request.label || '',
        request.memo || ''
      ],
    });
  };

  const executePayment = async (paymentId: string, amount: string) => {
    const value = parseEther(amount);
    
    return writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PAYMENT_CONTRACT_ABI,
      functionName: 'executePayment',
      args: [paymentId],
      value,
    });
  };

  const createRecurringPayment = async (request: PaymentRequest & { frequency: number }) => {
    const amount = parseEther(request.amount);
    
    return writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PAYMENT_CONTRACT_ABI,
      functionName: 'createRecurringPayment',
      args: [
        request.to,
        request.token === 'ETH' ? '0x0000000000000000000000000000000000000000' : request.token,
        amount,
        request.frequency,
        request.label || ''
      ],
    });
  };

  const batchPayment = async (recipients: string[], amounts: string[], token: string) => {
    const parsedAmounts = amounts.map(amount => parseEther(amount));
    const totalValue = parsedAmounts.reduce((sum, amount) => sum + amount, 0n);
    
    return writeContract({
      address: PAYMENT_CONTRACT_ADDRESS,
      abi: PAYMENT_CONTRACT_ABI,
      functionName: 'batchPayment',
      args: [recipients, token === 'ETH' ? '0x0000000000000000000000000000000000000000' : token, parsedAmounts],
      value: token === 'ETH' ? totalValue : 0n,
    });
  };

  return {
    createPayment,
    executePayment,
    createRecurringPayment,
    batchPayment,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
}