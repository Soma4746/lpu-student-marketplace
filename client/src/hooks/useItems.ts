import { useState, useEffect, useCallback } from 'react';
import { Item, SearchFilters, PaginationResponse } from '../types';
import { itemsAPI } from '../utils/api';
import toast from 'react-hot-toast';

interface UseItemsReturn {
  items: Item[];
  loading: boolean;
  error: string | null;
  pagination: any;
  fetchItems: (filters?: SearchFilters) => Promise<void>;
  likeItem: (itemId: string) => Promise<void>;
  reportItem: (itemId: string, reason: string, description?: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

export const useItems = (initialFilters?: SearchFilters): UseItemsReturn => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(initialFilters || {});

  const fetchItems = useCallback(async (filters?: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToUse = filters || currentFilters;
      setCurrentFilters(filtersToUse);
      
      const response = await itemsAPI.getItems(filtersToUse);
      const data: PaginationResponse<Item> = response.data;
      
      if (data.success) {
        setItems(data.data.items || []);
        setPagination(data.data.pagination);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch items';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const likeItem = useCallback(async (itemId: string) => {
    try {
      const response = await itemsAPI.likeItem(itemId);
      const { isLiked, likeCount } = response.data.data;
      
      // Update the item in the local state
      setItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId
            ? { ...item, isLiked, likeCount }
            : item
        )
      );
      
      toast.success(isLiked ? 'Item liked!' : 'Item unliked!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to like item';
      toast.error(message);
    }
  }, []);

  const reportItem = useCallback(async (itemId: string, reason: string, description?: string) => {
    try {
      await itemsAPI.reportItem(itemId, { reason, description });
      toast.success('Item reported successfully');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to report item';
      toast.error(message);
    }
  }, []);

  const refreshItems = useCallback(async () => {
    await fetchItems(currentFilters);
  }, [fetchItems, currentFilters]);

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    pagination,
    fetchItems,
    likeItem,
    reportItem,
    refreshItems,
  };
};

// Hook for single item
interface UseItemReturn {
  item: Item | null;
  loading: boolean;
  error: string | null;
  fetchItem: (id: string) => Promise<void>;
  likeItem: () => Promise<void>;
  reportItem: (reason: string, description?: string) => Promise<void>;
}

export const useItem = (itemId?: string): UseItemReturn => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(!!itemId);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await itemsAPI.getItem(id);
      if (response.data.success) {
        setItem(response.data.data.item);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch item';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const likeItem = useCallback(async () => {
    if (!item) return;
    
    try {
      const response = await itemsAPI.likeItem(item._id);
      const { isLiked, likeCount } = response.data.data;
      
      setItem(prevItem => 
        prevItem ? { ...prevItem, isLiked, likeCount } : null
      );
      
      toast.success(isLiked ? 'Item liked!' : 'Item unliked!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to like item';
      toast.error(message);
    }
  }, [item]);

  const reportItem = useCallback(async (reason: string, description?: string) => {
    if (!item) return;
    
    try {
      await itemsAPI.reportItem(item._id, { reason, description });
      toast.success('Item reported successfully');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to report item';
      toast.error(message);
    }
  }, [item]);

  useEffect(() => {
    if (itemId) {
      fetchItem(itemId);
    }
  }, [itemId, fetchItem]);

  return {
    item,
    loading,
    error,
    fetchItem,
    likeItem,
    reportItem,
  };
};

// Hook for user's items
export const useUserItems = (userId?: string, filters?: SearchFilters) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  const fetchUserItems = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await itemsAPI.getItems({ ...filters, seller: userId });
      const data: PaginationResponse<Item> = response.data;
      
      if (data.success) {
        setItems(data.data.items || []);
        setPagination(data.data.pagination);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch user items';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  useEffect(() => {
    fetchUserItems();
  }, [fetchUserItems]);

  return {
    items,
    loading,
    error,
    pagination,
    refetch: fetchUserItems,
  };
};
