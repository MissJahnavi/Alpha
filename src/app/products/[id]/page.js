'use client';

import React, { use, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import Loader from '@/components/ui/Loader';
import { SkeletonLine } from '@/components/LoadingSkeleton';
import { getProductById, setProductPublishedState, getRelatedProducts } from '@/services/products';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight,
  Info,
  Calendar,
  Truck,
  RotateCcw,
  Ruler
} from 'lucide-react';

const RelatedProductItem = React.memo(({ item }) => {
  return (
    <Link 
      href={`/products/${item.id}`} 
      className="bg-white border border-zinc-200 rounded-xl p-3 shadow-2xs hover:shadow-xs hover:translate-y-[-1px] transition-all duration-200 flex flex-col gap-2.5 dark:bg-zinc-950 dark:border-zinc-800 group"
    >
      <div className="aspect-square bg-zinc-50 dark:bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-100 dark:border-zinc-900">
        <img
          src={item.thumbnail}
          alt={item.title}
          loading="lazy"
          className="h-28 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150&q=80';
          }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-none">
          {item.category}
        </span>
        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
          {item.title}
        </h4>
        <span className="text-xs font-extrabold text-zinc-900 dark:text-white mt-0.5">
          ${Number(item.price).toFixed(2)}
        </span>
      </div>
    </Link>
  );
});
RelatedProductItem.displayName = 'RelatedProductItem';

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [isPublished, setIsPublished] = useState(true);
  const [relatedItems, setRelatedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const item = await getProductById(productId, user?.role || 'user');
        setProduct(item);
        setIsPublished(item.isPublished);
        setActiveImageIndex(0);

        const related = await getRelatedProducts(item.id, item.category, user?.role || 'user');
        setRelatedItems(related);
      } catch (err) {
        console.error('Error details page load:', err);
        if (err.message.includes('unpublished') || err.message.includes('not available')) {
          router.replace('/unauthorized');
        } else {
          setErrorMsg(err.message || 'Product records not found. It may have been archived.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    if (productId && user) {
      loadData();
    }
  }, [productId, user, router]);

  useEffect(() => {
    const handleStorageUpdate = async () => {
      if (!productId || !user) return;
      try {
        const item = await getProductById(productId, user?.role || 'user');
        setIsPublished(item.isPublished);
      } catch (e) {
        router.replace('/unauthorized');
      }
    };
    window.addEventListener('local-storage-update', handleStorageUpdate);
    return () => {
      window.removeEventListener('local-storage-update', handleStorageUpdate);
    };
  }, [productId, user, router]);

  const imagesList = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0 
      ? product.images 
      : [product.thumbnail];
  }, [product]);

  const handlePrev = useCallback(() => {
    if (imagesList.length <= 1) return;
    setActiveImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  }, [imagesList.length]);

  const handleNext = useCallback(() => {
    if (imagesList.length <= 1) return;
    setActiveImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  }, [imagesList.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!product || imagesList.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, imagesList, handlePrev, handleNext]);

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const handlePublishToggle = () => {
    if (!isAdmin || !product) return;
    const nextState = !isPublished;
    setIsPublished(nextState);
    
    setProductPublishedState(product.id, nextState);
    
    triggerToast(
      `Product catalog status updated to: ${nextState ? 'PUBLISHED' : 'UNPUBLISHED (DRAFT)'}`,
      nextState ? 'success' : 'warning'
    );
  };

  const computedSku = useMemo(() => {
    if (!product) return '';
    return product.sku || `SKU-ALPHA-${product.id}-${(product.category || 'GEN').substring(0, 3).toUpperCase()}`;
  }, [product]);

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge variant="error" className="uppercase font-bold text-[9px]">Out of Stock</Badge>;
    if (stock <= 10) return <Badge variant="warning" className="uppercase font-bold text-[9px]">Low Stock</Badge>;
    return <Badge variant="success" className="uppercase font-bold text-[9px]">Available</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/products" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-150">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Catalog Directory</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <SkeletonLine className="aspect-square w-full rounded-xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonLine key={i} className="h-14 w-14 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-5 pt-2">
              <div className="flex flex-col gap-2">
                <SkeletonLine className="h-4 w-1/5" />
                <SkeletonLine className="h-8 w-3/4 mt-1" />
              </div>
              <SkeletonLine className="h-6 w-1/4" />
              <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-1" />
              <div className="flex flex-col gap-2">
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-full" />
                <SkeletonLine className="h-4 w-2/3" />
              </div>
              <SkeletonLine className="h-20 w-full rounded-xl mt-4" />
            </div>
          </div>
        </div>
      ) : errorMsg ? (
        <div className="max-w-md mx-auto text-center py-12 flex flex-col items-center gap-4">
          <ShieldAlert className="h-12 w-12 text-red-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Lookup Error</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{errorMsg}</p>
          <Link href="/products" passHref legacyBehavior>
            <Button variant="outline">Back to Products</Button>
          </Link>
        </div>
      ) : product ? (
        <div className="flex flex-col gap-10">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950/80 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="relative aspect-square bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 overflow-hidden flex items-center justify-center group">
                  <img
                    src={imagesList[activeImageIndex]}
                    alt={`${product.title} - view image ${activeImageIndex + 1}`}
                    loading="lazy"
                    className="max-h-[300px] w-auto object-contain transition-all duration-300 transform group-hover:scale-102"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&q=80';
                    }}
                  />
                  
                  {imagesList.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 border border-zinc-200 text-zinc-700 hover:bg-white hover:scale-105 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-950 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer select-none"
                        aria-label="Previous product image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 border border-zinc-200 text-zinc-700 hover:bg-white hover:scale-105 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-950 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer select-none"
                        aria-label="Next product image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <Badge variant={isPublished ? 'success' : 'warning'} className="uppercase text-[9px] px-2.5 font-bold tracking-wider shadow-sm select-none">
                      {isPublished ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                {imagesList.length > 1 && (
                  <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Product thumbnail images selector">
                    {imagesList.map((img, idx) => {
                      const isActive = activeImageIndex === idx;
                      return (
                        <button
                          key={img + '-' + idx}
                          role="tab"
                          aria-selected={isActive}
                          aria-label={`Show image preview ${idx + 1}`}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-14 w-14 bg-zinc-50 dark:bg-zinc-900 rounded-lg overflow-hidden border transition-all duration-150 p-1 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 ${
                            isActive 
                              ? 'border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100' 
                              : 'border-zinc-200/60 hover:border-zinc-400 dark:border-zinc-800'
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            loading="lazy"
                            className="h-12 w-auto object-contain"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&q=80';
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between pt-2">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2 select-none">
                    <Badge variant="neutral" className="capitalize text-[10px] py-0.5 font-bold tracking-wide">{product.category}</Badge>
                    <span className="text-xs font-semibold text-zinc-450">Brand: {product.brand || 'Alpha'}</span>
                    <span className="text-zinc-200 dark:text-zinc-800">|</span>
                    <span className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400">SKU: {computedSku}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                      {product.title}
                    </h1>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex text-amber-400 select-none">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating || 4.5) ? 'fill-current' : 'text-zinc-250 dark:text-zinc-850'}`} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-zinc-650 dark:text-zinc-350 select-none">
                        {product.rating || 4.5} Score
                      </span>
                    </div>
                  </div>

                  <div className="py-3 border-y border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.discountPercentage && (
                        <span className="text-xs font-bold text-red-650 bg-red-50 px-2 py-0.5 rounded-md border border-red-100/30 dark:bg-red-950/20 dark:text-red-400 select-none">
                          -{product.discountPercentage}% Discount
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 select-none">
                      {getStockBadge(product.stock)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 select-none">Description</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      {product.description || 'No description available.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {product.dimensions && product.dimensions.width && (
                      <div className="flex gap-3 items-start p-3 bg-zinc-50/50 border border-zinc-150 rounded-xl dark:bg-zinc-900/10 dark:border-zinc-800/80">
                        <Ruler className="h-4.5 w-4.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Dimensions</span>
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                            {product.dimensions.width}W x {product.dimensions.height}H x {product.dimensions.depth}D mm
                          </span>
                        </div>
                      </div>
                    )}

                    {product.warrantyInformation && (
                      <div className="flex gap-3 items-start p-3 bg-zinc-50/50 border border-zinc-150 rounded-xl dark:bg-zinc-900/10 dark:border-zinc-800/80">
                        <Calendar className="h-4.5 w-4.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Warranty & Service</span>
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                            {product.warrantyInformation}
                          </span>
                        </div>
                      </div>
                    )}

                    {product.shippingInformation && (
                      <div className="flex gap-3 items-start p-3 bg-zinc-50/50 border border-zinc-150 rounded-xl dark:bg-zinc-900/10 dark:border-zinc-800/80">
                        <Truck className="h-4.5 w-4.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Shipping Telemetry</span>
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                            {product.shippingInformation}
                          </span>
                        </div>
                      </div>
                    )}

                    {product.returnPolicy && (
                      <div className="flex gap-3 items-start p-3 bg-zinc-50/50 border border-zinc-150 rounded-xl dark:bg-zinc-900/10 dark:border-zinc-800/80">
                        <RotateCcw className="h-4.5 w-4.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Return Protocol</span>
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">
                            {product.returnPolicy}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 select-none">
                      {product.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="text-[10px] font-bold text-zinc-500 bg-zinc-100/60 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-850 px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-150 dark:border-zinc-800 flex flex-col gap-4">
                  {isAdmin ? (
                    <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-900/30 dark:border-zinc-800/80">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">Catalog Visibility Manager</span>
                          <span className="text-[11px] text-zinc-450 dark:text-zinc-455">Toggles whether standard users can see this item.</span>
                        </div>
                        
                        <button 
                          onClick={handlePublishToggle}
                          className="text-zinc-650 hover:text-zinc-900 dark:hover:text-white focus:outline-none cursor-pointer"
                          aria-label="Toggle product visible state"
                        >
                          {isPublished ? (
                            <ToggleRight className="h-9 w-9 text-indigo-650 dark:text-indigo-400 animate-in fade-in" />
                          ) : (
                            <ToggleLeft className="h-9 w-9 text-zinc-400 animate-in fade-in" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2.5 items-start p-3.5 bg-zinc-50 border border-zinc-200/60 rounded-xl dark:bg-zinc-900/30 dark:border-zinc-800/60 select-none">
                      <Info className="h-4.5 w-4.5 text-zinc-500 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">Catalog Read-Only Access</span>
                        <span>You are logged in under Staff view. Modifying inventory values is restricted to Administrators.</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

          {relatedItems.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 select-none">Related Products</h3>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 leading-normal select-none">More items from the same directory category</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedItems.map((item) => (
                  <RelatedProductItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <Toast
        isOpen={toastOpen}
        message={toastMsg}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
    </DashboardLayout>
  );
}
