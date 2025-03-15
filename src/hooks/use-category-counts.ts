import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useCategoryCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: countError } = await supabase
        .from('model_category_assignments')
        .select('category_id, count', { count: 'exact' })
        .select('category_id')
        .then(({ data }) => {
          // Count occurrences of each category_id
          const counts = (data || []).reduce((acc, { category_id }) => {
            acc[category_id] = (acc[category_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return { data: counts };
        });

      if (countError) throw countError;
      setCounts(data || {});
    } catch (err) {
      console.error('Error loading category counts:', err);
      setError('Failed to load category counts');
    } finally {
      setLoading(false);
    }
  };

  return { counts, loading, error };
}