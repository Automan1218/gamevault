import { useState, useEffect, useCallback } from 'react';
import { shoppingApi } from '../services/shoppingApi';
import type { GameDTO } from '../../../features/shopping/types/storeTypes';

interface UseGamesOptions {
  initialCategory?: string;
  pageSize?: number;
}

export const useGames = ({ initialCategory = 'all', pageSize = 12 }: UseGamesOptions = {}) => {
  const [games, setGames] = useState<GameDTO[]>([]);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载函数
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shoppingApi.getGames({
        page: page - 1, // 后端分页一般从 0 开始
        size: pageSize,
        category: category !== 'all' ? category : undefined,
      });

      // ✅ 直接存 GameDTO[]
      setGames(res.games);
      setTotal(res.totalCount);
    } catch (err: unknown) {
      console.error('useGames fetch error:', err);
      if (err instanceof Error) {
        setError(err.message || '加载失败');
      } else {
        setError('加载失败');
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, category]);

  // 首次 & 更新时加载
  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return {
    games,
    category,
    page,
    total,
    pageSize,
    loading,
    error,
    setCategory,
    setPage,
    reload: fetchGames,
  };
};
