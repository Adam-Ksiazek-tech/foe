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
  updateInvestment: (id: string, parsedAmount: number | null) => Promise<void>;
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

  const updateInvestment = useCallback(async (id: string, parsedAmount: number | null) => {
    try {
      const response = await fetch('/api/investments/proxy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, parsedAmount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      // Aktualizuj lokalną tablica
      setData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, parsedAmount } : item
        )
      );
    } catch (err) {
      console.error('Update failed:', err);
      throw err;
    }
  }, []);

  const deleteAllInvestments = useCallback(async () => {
    try {
      const response = await fetch('/api/investments/proxy', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setData([]);
    } catch (err) {
      console.error('Delete failed:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData, updateInvestment, deleteAllInvestments };
}