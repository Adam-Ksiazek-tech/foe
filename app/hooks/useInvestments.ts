import { useEffect, useState, useCallback } from 'react';

export interface Investment {
  id: string;
  msgId: string;
  conversationId: string;
  playerId: string;
  playerName: string;
  text: string;
  gameDate: string;
  beautyDate: string;
  parsedAmount: number | null;
  parsedOk: boolean;
  receivedAt: string;
}

interface UseInvestmentsReturn {
  data: Investment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useInvestments(): UseInvestmentsReturn {
  const [data, setData] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/investments/proxy', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',      
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const investments = await response.json();
      setData(investments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}