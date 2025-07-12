import { PaymentRequest } from '../types';

export const MONADPAY_SCHEME = 'monadpay://';
export const FALLBACK_BASE = window.location.origin + '/pay';

export function generatePaymentLink(request: PaymentRequest): string {
  const params = new URLSearchParams();
  
  params.set('to', request.to);
  params.set('amount', request.amount);
  
  if (request.token) params.set('token', request.token);
  if (request.label) params.set('label', request.label);
  if (request.memo) params.set('memo', request.memo);
  if (request.expires) params.set('expires', request.expires);
  if (request.recurring) params.set('recurring', 'true');
  if (request.frequency) params.set('frequency', request.frequency);
  
  return `${MONADPAY_SCHEME}send?${params.toString()}`;
}

export function generateFallbackLink(request: PaymentRequest): string {
  const params = new URLSearchParams();
  
  params.set('to', request.to);
  params.set('amount', request.amount);
  
  if (request.token) params.set('token', request.token);
  if (request.label) params.set('label', request.label);
  if (request.memo) params.set('memo', request.memo);
  if (request.expires) params.set('expires', request.expires);
  if (request.recurring) params.set('recurring', 'true');
  if (request.frequency) params.set('frequency', request.frequency);
  
  return `${FALLBACK_BASE}?${params.toString()}`;
}

export function parsePaymentLink(url: string): PaymentRequest | null {
  try {
    let urlToParse = url;
    
    if (url.startsWith(MONADPAY_SCHEME)) {
      urlToParse = url.replace(MONADPAY_SCHEME + 'send?', 'https://dummy.com?');
    } else if (url.startsWith(FALLBACK_BASE)) {
      // Already a valid URL
    } else {
      return null;
    }
    
    const urlObj = new URL(urlToParse);
    const params = urlObj.searchParams;
    
    const to = params.get('to');
    const amount = params.get('amount');
    
    if (!to || !amount) return null;
    
    return {
      to,
      amount,
      token: params.get('token') || undefined,
      label: params.get('label') || undefined,
      memo: params.get('memo') || undefined,
      expires: params.get('expires') || undefined,
      recurring: params.get('recurring') === 'true',
      frequency: (params.get('frequency') as any) || undefined,
    };
  } catch {
    return null;
  }
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount: string): boolean {
  return !isNaN(Number(amount)) && Number(amount) > 0;
}