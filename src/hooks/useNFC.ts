import { useState, useCallback } from 'react';

interface NFCData {
  url: string;
  label?: string;
}

export function useNFC() {
  const [isSupported, setIsSupported] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // Check NFC support
  const checkNFCSupport = useCallback(() => {
    if ('NDEFReader' in window) {
      setIsSupported(true);
      return true;
    }
    return false;
  }, []);

  // Write NFC tag
  const writeNFC = useCallback(async (data: NFCData): Promise<boolean> => {
    if (!('NDEFWriter' in window)) {
      throw new Error('NFC writing not supported');
    }

    setIsWriting(true);
    
    try {
      const ndef = new (window as any).NDEFWriter();
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: data.url
          },
          ...(data.label ? [{
            recordType: 'text',
            data: data.label
          }] : [])
        ]
      });
      
      setIsWriting(false);
      return true;
    } catch (error) {
      setIsWriting(false);
      throw error;
    }
  }, []);

  // Read NFC tag
  const readNFC = useCallback(async (): Promise<string | null> => {
    if (!('NDEFReader' in window)) {
      throw new Error('NFC reading not supported');
    }

    setIsReading(true);
    
    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      
      return new Promise((resolve) => {
        ndef.addEventListener('reading', ({ message }: any) => {
          for (const record of message.records) {
            if (record.recordType === 'url') {
              const textDecoder = new TextDecoder(record.encoding);
              const url = textDecoder.decode(record.data);
              setIsReading(false);
              resolve(url);
              return;
            }
          }
          setIsReading(false);
          resolve(null);
        });
      });
    } catch (error) {
      setIsReading(false);
      throw error;
    }
  }, []);

  return {
    isSupported: checkNFCSupport(),
    isWriting,
    isReading,
    writeNFC,
    readNFC,
    checkNFCSupport,
  };
}