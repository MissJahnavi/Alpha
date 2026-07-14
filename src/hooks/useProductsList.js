'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getProducts, getCategories } from '@/services/products';
import { useAuth } from './useAuth';

/**
 * Custom React Hook to manage Product Catalog state, filter queries,
 * page offsets, sorting columns, and synchronization with URL parameters.
 */
export function useProductsList() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlSort = searchParams.get('sort') || '';
  const urlPage = Number(searchParams.get('page')) || 1;
  
  // Resolve page limit: URL value -> LocalStorage fallback -> Default (10)
  const defaultPageSize = useMemo(() => {
    if (typeof window === 'undefined') return 10;
    try {
      const saved = window.localStorage.getItem('alpha_products_page_size');
      return saved ? Number(saved) : 10;
    } catch (e) {
      return 10;
    }
  }, []);
  const urlLimit = Number(searchParams.get('limit')) || defaultPageSize;

  const [products, setProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  // Local state to keep UI inputs responsive on rapid keystrokes
  const [searchInputValue, setSearchInputValue] = useState(urlSearch);

  useEffect(() => {
    setSearchInputValue(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    let active = true;
    async function loadCats() {
      try {
        const list = await getCategories();
        if (active) setCategoriesList(list);
      } catch (err) {
        console.warn('Error loading categories inside hook:', err);
      }
    }
    loadCats();
    return () => { active = false; };
  }, []);

  const updateUrlParams = useCallback((newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Debounce search updates to prevent layout redraws on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInputValue !== urlSearch) {
        updateUrlParams({ search: searchInputValue, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInputValue, urlSearch, updateUrlParams]);

  const fetchProductData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = (urlPage - 1) * urlLimit;
      const result = await getProducts({
        limit: urlLimit,
        skip,
        category: urlCategory,
        q: urlSearch,
        sortBy: urlSort.split('-')[0] || undefined,
        order: urlSort.split('-')[1] || undefined,
        role: user?.role || 'user',
      });
      
      setProducts(result.products);
      setTotalItems(result.total);
    } catch (err) {
      console.error('Error fetching products inside hook:', err);
      setError(err.message || 'Failed to query products catalog database.');
    } finally {
      setIsLoading(false);
    }
  }, [urlSearch, urlCategory, urlSort, urlPage, urlLimit, user]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Listen to LocalStorage updates for cross-component catalog sync
  useEffect(() => {
    const handleStorageReload = () => {
      fetchProductData();
    };
    window.addEventListener('local-storage-update', handleStorageReload);
    return () => {
      window.removeEventListener('local-storage-update', handleStorageReload);
    };
  }, [fetchProductData]);

  const setSearch = useCallback((val) => {
    setSearchInputValue(val);
  }, []);

  const setCategories = useCallback((catsArray) => {
    const categoryStr = catsArray.join(',');
    updateUrlParams({ category: categoryStr, page: 1 });
  }, [updateUrlParams]);

  const setSort = useCallback((sortVal) => {
    updateUrlParams({ sort: sortVal, page: 1 });
  }, [updateUrlParams]);

  const setPage = useCallback((nextPage) => {
    updateUrlParams({ page: nextPage });
  }, [updateUrlParams]);

  const setPageSize = useCallback((size) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('alpha_products_page_size', size.toString());
    }
    updateUrlParams({ limit: size, page: 1 });
  }, [updateUrlParams]);

  const clearFilters = useCallback(() => {
    setSearchInputValue('');
    updateUrlParams({ search: '', category: '', sort: '', page: 1 });
  }, [updateUrlParams]);

  const selectedCategories = useMemo(() => {
    return urlCategory ? urlCategory.split(',').filter(Boolean) : [];
  }, [urlCategory]);

  return {
    products,
    categoriesList,
    isLoading,
    error,
    totalItems,
    searchInputValue,
    selectedCategories,
    currentSort: urlSort,
    currentPage: urlPage,
    pageSize: urlLimit,
    setSearch,
    setCategories,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    reload: fetchProductData,
  };
}

export default useProductsList;
