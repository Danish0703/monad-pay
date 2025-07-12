export interface PaymentRequest {
  to: string;
  amount: string;
  token?: string;
  label?: string;
  memo?: string;
  expires?: string;
  recurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

export interface GeneratedLink {
  id: string;
  url: string;
  qrCode: string;
  request: PaymentRequest;
  createdAt: Date;
  clickCount: number;
}

export interface WalletState {
  isConnected: boolean;
  address?: string;
  balance?: string;
}