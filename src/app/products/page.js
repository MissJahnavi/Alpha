'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import TableContainer from '@/components/TableContainer';
import SearchInput from '@/components/ui/SearchInput';
import Dropdown from '@/components/ui/Dropdown';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import Toast from '@/components/ui/Toast';
import { useProductsList } from '@/hooks/useProductsList';
import { setProductPublishedState, refreshProductsCache } from '@/services/products';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShoppingBag, 
  Eye, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  ToggleRight,
  ToggleLeft,
  SlidersHorizontal,
  Plus
} from 'lucide-react';

const DEFAULT_COLUMNS = ['image', 'name', 'category', 'price', 'discount', 'rating', 'stock', 'published', 'actions'];

const COLUMN_LABELS = {
  image: 'Preview',
  name: 'Product Name',
  category: 'Category',
  price: 'Price',
  discount: 'Discount',
  rating: 'Rating',
  stock: 'Stock Status',
  published: 'Published',
  actions: 'Actions',
};

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const {
    products,
    categoriesList,
    isLoading,
    error,
    totalItems,
    searchInputValue,
    selectedCategories,
    currentSort,
    currentPage,
    pageSize,
    setSearch,
    setCategories,
    setSort,
    setPage,
    setPageSize,
    clearFilters,
    reload,
  } = useProductsList();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Real-time synchronization polling (runs every 15s using cache-busting service fetches)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(async () => {
      try {
        await refreshProductsCache();
        reload();
        triggerToast('Product catalog synchronized in real-time', 'info');
      } catch (e) {
        console.warn('Real-time polling sync failed:', e);
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, [reload]);

  const [columnOrder, setColumnOrder] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_COLUMNS;
    try {
      const saved = window.localStorage.getItem('alpha_table_column_order');
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch (e) {
      return DEFAULT_COLUMNS;
    }
  });

  const [visibleColumns, setVisibleColumns] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_COLUMNS;
    try {
      const saved = window.localStorage.getItem('alpha_table_columns');
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch (e) {
      return DEFAULT_COLUMNS;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('alpha_table_column_order', JSON.stringify(columnOrder));
    }
  }, [columnOrder]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('alpha_table_columns', JSON.stringify(visibleColumns));
    }
  }, [visibleColumns]);

  const activeColumns = useMemo(() => {
    let cols = columnOrder.filter(col => visibleColumns.includes(col));
    if (!isAdmin) {
      cols = cols.filter(col => col !== 'published');
    }
    return cols;
  }, [columnOrder, visibleColumns, isAdmin]);

  const [draggedColId, setDraggedColId] = useState(null);

  const handleDragStart = (e, colId) => {
    setDraggedColId(colId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
  };

  // Mutates order indices on element drop and persists updates locally
  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    if (!draggedColId || draggedColId === targetColId) return;

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColId);
    const targetIndex = newOrder.indexOf(targetColId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColId);

    setColumnOrder(newOrder);
    setDraggedColId(null);
    triggerToast('Columns layout reordered', 'success');
  };

  const handleSortHeader = (columnKey) => {
    const [sortCol, sortOrd] = currentSort.split('-');
    if (sortCol === columnKey) {
      if (sortOrd === 'asc') {
        setSort(`${columnKey}-desc`);
      } else {
        setSort('');
      }
    } else {
      setSort(`${columnKey}-asc`);
    }
  };

  const renderSortIndicator = (columnKey) => {
    const [sortCol, sortOrd] = currentSort.split('-');
    if (sortCol !== columnKey) {
      return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortOrd === 'asc' 
      ? <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-zinc-900 dark:text-white font-bold" />
      : <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-zinc-900 dark:text-white font-bold" />;
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return <Badge variant="error" className="text-[9px] uppercase font-bold tracking-wider">Out of Stock</Badge>;
    }
    if (stock <= 10) {
      return <Badge variant="warning" className="text-[9px] uppercase font-bold tracking-wider">Low Stock ({stock})</Badge>;
    }
    return <Badge variant="success" className="text-[9px] uppercase font-bold tracking-wider">{stock} In Stock</Badge>;
  };

  const sortOptions = [
    { label: 'Sort by: Relevancy', value: '' },
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Price (Low to High)', value: 'price-asc' },
    { label: 'Price (High to Low)', value: 'price-desc' },
    { label: 'Rating (Low to High)', value: 'rating-asc' },
    { label: 'Rating (High to Low)', value: 'rating-desc' },
    { label: 'Stock (Low to High)', value: 'stock-asc' },
    { label: 'Stock (High to Low)', value: 'stock-desc' },
  ];

  const pageSizeOptions = [
    { label: '10 per page', value: '10' },
    { label: '20 per page', value: '20' },
    { label: '50 per page', value: '50' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 select-none">
            Product Listing
          </h1>
          <p className="text-xs font-semibold text-zinc-450 dark:text-zinc-500 leading-normal">
            Manage product visibilities, view reviews, and navigate detailed catalog folders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-zinc-500 bg-zinc-200/40 px-3 py-1.5 rounded-lg border border-zinc-200/30 dark:bg-zinc-900/60 dark:border-zinc-800/60 select-none">
            Matched: <span className="text-zinc-900 dark:text-zinc-200 font-extrabold">{totalItems}</span>
          </div>
          {isAdmin && (
            <Button variant="primary" className="font-semibold gap-2 py-1.5 text-xs">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <SearchInput
            placeholder="Search by Name, Brand, or Category..."
            value={searchInputValue}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-3">
          <Dropdown
            closeOnSelect={false}
            align="right"
            trigger={
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold border border-zinc-200 bg-white hover:bg-zinc-55 text-zinc-700 rounded-lg shadow-2xs transition-colors duration-150 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer select-none">
                <Filter className="h-4 w-4 text-zinc-400" />
                <span>Category</span>
                {selectedCategories.length > 0 && (
                  <span className="h-4.5 min-w-4.5 px-1 flex items-center justify-center text-[9px] font-black text-white bg-indigo-650 rounded-full leading-none">
                    {selectedCategories.length}
                  </span>
                )}
              </button>
            }
          >
            <div className="p-1 max-h-60 overflow-y-auto flex flex-col gap-0.5 scrollbar-thin">
              <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-900 text-[10px] font-bold text-zinc-450 uppercase select-none">
                Choose Categories
              </div>
              {categoriesList.map((cat) => {
                const isChecked = selectedCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 rounded-md cursor-pointer select-none transition-colors duration-100 dark:text-zinc-300 dark:hover:bg-zinc-900 font-semibold"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const next = checked
                          ? [...selectedCategories, cat]
                          : selectedCategories.filter((c) => c !== cat);
                        setCategories(next);
                      }}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-550 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                    <span className="capitalize">{cat.replace(/-/g, ' ')}</span>
                  </label>
                );
              })}
            </div>
          </Dropdown>

          <Dropdown
            closeOnSelect={false}
            align="right"
            trigger={
              <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold border border-zinc-200 bg-white hover:bg-zinc-55 text-zinc-700 rounded-lg shadow-2xs transition-colors duration-150 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer select-none">
                <SlidersHorizontal className="h-4 w-4 text-zinc-400" />
                <span>Columns</span>
              </button>
            }
          >
            <div className="p-1 max-h-60 overflow-y-auto flex flex-col gap-0.5 scrollbar-thin">
              <div className="px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-900 text-[10px] font-bold text-zinc-450 uppercase select-none">
                Show/Hide Columns
              </div>
              {DEFAULT_COLUMNS.map((colId) => {
                if (colId === 'published' && !isAdmin) return null;
                const isChecked = visibleColumns.includes(colId);
                return (
                  <label
                    key={colId}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 rounded-md cursor-pointer select-none transition-colors duration-100 dark:text-zinc-300 dark:hover:bg-zinc-900 font-semibold"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const next = checked
                          ? [...visibleColumns, colId]
                          : visibleColumns.filter((c) => c !== colId);
                        setVisibleColumns(next);
                      }}
                      className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-550 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                    />
                    <span>{COLUMN_LABELS[colId]}</span>
                  </label>
                );
              })}
            </div>
          </Dropdown>

          <div className="w-44">
            <Select
              options={sortOptions}
              value={currentSort}
              onChange={(e) => setSort(e.target.value)}
              className="py-1.5 text-xs font-bold leading-normal shadow-2xs cursor-pointer select-none"
              aria-label="Sort products by column value"
            />
          </div>

          <div className="w-36">
            <Select
              options={pageSizeOptions}
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="py-1.5 text-xs font-bold leading-normal shadow-2xs cursor-pointer select-none"
              aria-label="Page size options count"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={pageSize} cols={activeColumns.length} />
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-red-200 bg-red-50/10 dark:border-red-900/20 dark:bg-red-950/5">
          <h4 className="text-sm font-bold text-red-650 dark:text-red-400">Connection Interrupted</h4>
          <p className="text-xs text-zinc-450 mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={clearFilters}>Try Resetting Filters</Button>
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products match filters"
          description="Your active search filters yielded no matched items. Try resetting query parameters."
          icon={ShoppingBag}
          actionText="Reset All Filters"
          onActionClick={clearFilters}
        />
      ) : (
        <div className="flex flex-col flex-grow">
          
          <div className="hidden lg:block">
            <TableContainer>
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150 dark:bg-zinc-900/40 dark:border-zinc-800 text-xs font-bold text-zinc-400 uppercase select-none">
                  
                  {activeColumns.map((colId) => {
                    const dragProps = {
                      draggable: true,
                      onDragStart: (e) => handleDragStart(e, colId),
                      onDragOver: (e) => handleDragOver(e, colId),
                      onDrop: (e) => handleDrop(e, colId),
                      className: 'cursor-grab active:cursor-grabbing hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 transition-colors py-3.5 px-6 relative'
                    };

                    if (colId === 'image') {
                      return <th key="image" {...dragProps} className={`${dragProps.className} w-16`}>Preview</th>;
                    }
                    if (colId === 'name') {
                      return (
                        <th key="name" {...dragProps} onClick={() => handleSortHeader('name')}>
                          <div className="flex items-center">
                            Product Name & Brand
                            {renderSortIndicator('name')}
                          </div>
                        </th>
                      );
                    }
                    if (colId === 'category') {
                      return <th key="category" {...dragProps}>Category</th>;
                    }
                    if (colId === 'price') {
                      return (
                        <th key="price" {...dragProps} onClick={() => handleSortHeader('price')}>
                          <div className="flex items-center justify-end">
                            Price
                            {renderSortIndicator('price')}
                          </div>
                        </th>
                      );
                    }
                    if (colId === 'discount') {
                      return <th key="discount" {...dragProps} className={`${dragProps.className} text-center w-24`}>Discount</th>;
                    }
                    if (colId === 'rating') {
                      return (
                        <th key="rating" {...dragProps} onClick={() => handleSortHeader('rating')}>
                          <div className="flex items-center justify-center">
                            Rating
                            {renderSortIndicator('rating')}
                          </div>
                        </th>
                      );
                    }
                    if (colId === 'stock') {
                      return (
                        <th key="stock" {...dragProps} onClick={() => handleSortHeader('stock')}>
                          <div className="flex items-center">
                            Stock
                            {renderSortIndicator('stock')}
                          </div>
                        </th>
                      );
                    }
                    if (colId === 'published') {
                      return <th key="published" {...dragProps} className={`${dragProps.className} text-center w-28`}>Published</th>;
                    }
                    if (colId === 'actions') {
                      return <th key="actions" {...dragProps} className={`${dragProps.className} text-center w-20`}>Actions</th>;
                    }
                    return null;
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {products.map((p) => (
                  <tr 
                    key={p.id} 
                    onClick={() => router.push(`/products/${p.id}`)}
                    className="hover:bg-zinc-55/40 dark:hover:bg-zinc-900/20 transition-all duration-150 cursor-pointer group"
                  >
                    
                    {activeColumns.map((colId) => {
                      if (colId === 'image') {
                        return (
                          <td key="image" className="px-6 py-3">
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              loading="lazy"
                              className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200/50 dark:border-zinc-800 object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&q=80';
                              }}
                            />
                          </td>
                        );
                      }
                      if (colId === 'name') {
                        return (
                          <td key="name" className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors duration-150">
                                {p.title}
                              </span>
                              <span className="text-xs text-zinc-400 font-semibold">{p.brand || 'Alpha'}</span>
                            </div>
                          </td>
                        );
                      }
                      if (colId === 'category') {
                        return (
                          <td key="category" className="px-6 py-4">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-550 border border-zinc-200/20 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800">
                              {p.category}
                            </span>
                          </td>
                        );
                      }
                      if (colId === 'price') {
                        return (
                          <td key="price" className="px-6 py-4 text-right font-extrabold text-zinc-900 dark:text-zinc-100">
                            ${Number(p.price).toFixed(2)}
                          </td>
                        );
                      }
                      if (colId === 'discount') {
                        return (
                          <td key="discount" className="px-6 py-4 text-center">
                            {p.discountPercentage ? (
                              <span className="text-xs font-bold text-red-650 bg-red-50/60 dark:bg-red-950/20 dark:text-red-400 px-2 py-0.5 rounded-md border border-red-100/30">
                                -{p.discountPercentage}%
                              </span>
                            ) : (
                              <span className="text-zinc-300 dark:text-zinc-800 font-medium">-</span>
                            )}
                          </td>
                        );
                      }
                      if (colId === 'rating') {
                        return (
                          <td key="rating" className="px-6 py-4 text-center font-bold text-zinc-800 dark:text-zinc-300">
                            <span className="text-xs">{p.rating || 4.5}</span>
                          </td>
                        );
                      }
                      if (colId === 'stock') {
                        return (
                          <td key="stock" className="px-6 py-4">
                            {getStockBadge(p.stock)}
                          </td>
                        );
                      }
                      if (colId === 'published') {
                        return (
                          <td key="published" className="px-6 py-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProductPublishedState(p.id, !p.isPublished);
                              }}
                              className="focus:outline-none cursor-pointer"
                              aria-label="Toggle product visible state"
                            >
                              {p.isPublished ? (
                                <ToggleRight className="h-6 w-6 text-indigo-650 dark:text-indigo-400" />
                              ) : (
                                <ToggleLeft className="h-6 w-6 text-zinc-350 dark:text-zinc-755" />
                              )}
                            </button>
                          </td>
                        );
                      }
                      if (colId === 'actions') {
                        return (
                          <td key="actions" className="px-6 py-4 text-center">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4.5 w-4.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white" />
                            </Button>
                          </td>
                        );
                      }
                      return null;
                    })}
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/products/${p.id}`)}
                className="bg-white border border-zinc-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow duration-200 cursor-pointer flex flex-col justify-between dark:bg-zinc-950 dark:border-zinc-800 group"
              >
                <div className="flex gap-3.5 mb-3.5">
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    loading="lazy"
                    className="h-16 w-16 rounded-lg bg-zinc-50 border border-zinc-200/50 dark:border-zinc-800 object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&q=80';
                    }}
                  />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-zinc-450 capitalize tracking-wide leading-none">{p.category}</span>
                    <h3 className="text-sm font-extrabold text-zinc-900 leading-snug group-hover:text-indigo-650 dark:text-zinc-150 transition-colors mt-0.5">
                      {p.title}
                    </h3>
                    <span className="text-xs text-zinc-450 font-semibold mt-0.5">{p.brand}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 mt-1.5 dark:border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Price</span>
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-white mt-0.5">
                      ${Number(p.price).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    {getStockBadge(p.stock)}
                    
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductPublishedState(p.id, !p.isPublished);
                        }}
                        className="focus:outline-none flex items-center gap-1 cursor-pointer select-none text-[10px] font-bold text-zinc-450 uppercase"
                      >
                        <span>{p.isPublished ? 'Live' : 'Draft'}</span>
                        {p.isPublished ? (
                          <ToggleRight className="h-5.5 w-5.5 text-indigo-650" />
                        ) : (
                          <ToggleLeft className="h-5.5 w-5.5 text-zinc-350" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={(next) => setPage(next)}
            className="mt-6"
          />
        </div>
      )}

      <Toast
        isOpen={toastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
    </DashboardLayout>
  );
}
