'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import TableContainer from '@/components/TableContainer';
import Badge from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';
import Link from 'next/link';
import { getProducts } from '@/services/products';
import { useAuth } from '@/hooks/useAuth';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Layers,
  ShoppingBag,
  EyeOff,
  Star,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Cpu,
  Coins,
  ShieldCheck,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';

const CHART_COLORS = [
  '#6366f1',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#8b5cf6',
  '#14b8a6',
];

const CustomTooltip = ({ active, payload, label, valType = 'number' }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const formatted = valType === 'currency'
      ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : value;
      
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs flex flex-col gap-1 text-white">
        <p className="font-bold text-zinc-400 select-none uppercase tracking-wider">{label}</p>
        <p className="font-extrabold text-white">
          {payload[0].name}: <span className="text-indigo-400">{formatted}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const result = await getProducts({ limit: 250, role: 'admin' });
        setProducts(result.products || []);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to query products catalog for analytics data.');
      } finally {
        setIsLoading(false);
      }
    }
    if (user) {
      loadData();
    }
  }, [user]);

  const kpis = useMemo(() => {
    const total = products.length;
    if (total === 0) {
      return {
        totalProducts: 0,
        publishedProducts: 0,
        hiddenProducts: 0,
        avgRating: '0.00',
        totalValue: 0,
        avgPrice: '0.00',
        lowStockCount: 0,
        outOfStockCount: 0,
      };
    }

    const published = products.filter(p => p.isPublished === true).length;
    const hidden = products.filter(p => p.isPublished === false).length;
    
    const sumRating = products.reduce((acc, p) => acc + (p.rating || 0), 0);
    const avgRating = (sumRating / total).toFixed(2);
    
    const totalVal = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
    
    const sumPrice = products.reduce((acc, p) => acc + (p.price || 0), 0);
    const avgPrice = (sumPrice / total).toFixed(2);
    
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;

    return {
      totalProducts: total,
      publishedProducts: published,
      hiddenProducts: hidden,
      avgRating,
      totalValue: totalVal,
      avgPrice,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
    };
  }, [products]);

  const categoryMap = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const cat = p.category;
      if (!map[cat]) {
        map[cat] = {
          name: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
          rawName: cat,
          count: 0,
          totalRating: 0,
          totalStock: 0,
          totalValue: 0,
        };
      }
      map[cat].count += 1;
      map[cat].totalRating += p.rating || 0;
      map[cat].totalStock += p.stock || 0;
      map[cat].totalValue += (p.price || 0) * (p.stock || 0);
    });
    return map;
  }, [products]);

  const categoryDistributionData = useMemo(() => {
    return Object.values(categoryMap).map(c => ({
      name: c.name,
      value: c.count,
    }));
  }, [categoryMap]);

  const productsPerCategoryData = useMemo(() => {
    return Object.values(categoryMap).map(c => ({
      name: c.name,
      Products: c.count,
    }));
  }, [categoryMap]);

  const avgRatingByCategoryData = useMemo(() => {
    return Object.values(categoryMap).map(c => ({
      name: c.name,
      Rating: Number((c.totalRating / c.count).toFixed(2)),
    }));
  }, [categoryMap]);

  const inventoryValueByCategoryData = useMemo(() => {
    return Object.values(categoryMap).map(c => ({
      name: c.name,
      Value: Number(c.totalValue.toFixed(2)),
    }));
  }, [categoryMap]);

  const businessInsights = useMemo(() => {
    const categories = Object.values(categoryMap);
    if (categories.length === 0) return [];
    
    const categoriesWithAvgRating = categories.map(c => ({
      ...c,
      avgRating: c.totalRating / c.count,
    }));

    const highestRated = [...categoriesWithAvgRating].sort((a, b) => b.avgRating - a.avgRating)[0];
    const lowestRated = [...categoriesWithAvgRating].sort((a, b) => a.avgRating - b.avgRating)[0];
    const largestStock = [...categories].sort((a, b) => b.totalStock - a.totalStock)[0];
    const maxProducts = [...categories].sort((a, b) => b.count - a.count)[0];
    
    const totalStockCount = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const avgStockVal = products.length ? Math.round(totalStockCount / products.length) : 0;

    return [
      {
        title: 'Highest Rated Category',
        category: highestRated.name,
        detail: `Average rating of ${highestRated.avgRating.toFixed(2)} ★ across ${highestRated.count} products.`,
        metric: `${highestRated.avgRating.toFixed(1)} ★`,
        type: 'positive',
      },
      {
        title: 'Lowest Rated Category',
        category: lowestRated.name,
        detail: `Average rating of ${lowestRated.avgRating.toFixed(2)} ★. May require catalog inventory updates.`,
        metric: `${lowestRated.avgRating.toFixed(1)} ★`,
        type: 'negative',
      },
      {
        title: 'Largest Stock Category',
        category: largestStock.name,
        detail: `Total stock of ${largestStock.totalStock} units, representing $${largestStock.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} in value.`,
        metric: `${largestStock.totalStock} units`,
        type: 'neutral',
      },
      {
        title: 'Maximum Catalog Density',
        category: maxProducts.name,
        detail: `Holds ${maxProducts.count} distinct products, comprising ${Math.round((maxProducts.count / products.length) * 100)}% of the catalog.`,
        metric: `${maxProducts.count} items`,
        type: 'neutral',
      },
      {
        title: 'Global Stock Velocity',
        category: 'All Categories',
        detail: `Average inventory stock of ${avgStockVal} units per product item.`,
        metric: `${avgStockVal} stock`,
        type: 'neutral',
      },
    ];
  }, [categoryMap, products]);

  const topRatedItems = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);
  }, [products]);

  const kpiConfigs = [
    { title: 'Total Products', value: kpis.totalProducts, desc: 'Global catalog items count', icon: Layers, trend: '+4.5% vs Q1', pos: true },
    { title: 'Published Products', value: kpis.publishedProducts, desc: 'Active listing visible to public', icon: ShoppingBag, trend: '+12 new', pos: true },
    { title: 'Hidden Products', value: kpis.hiddenProducts, desc: 'Draft items hidden from public', icon: EyeOff, trend: '4 archived', pos: false },
    { title: 'Average Rating', value: kpis.avgRating + ' ★', desc: 'Weighted average rating score', icon: Star, trend: '+0.12 ★', pos: true },
    { title: 'Total Inventory Value', value: `$${kpis.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, desc: 'Calculated as price × stock', icon: DollarSign, trend: '+8.4%', pos: true },
    { title: 'Average Product Price', value: `$${kpis.avgPrice}`, desc: 'Average catalog list price', icon: Coins, trend: 'stable', pos: true },
    { title: 'Low Stock Products', value: kpis.lowStockCount, desc: 'Products with stock < 10 items', icon: AlertTriangle, trend: 'Action needed', pos: false },
    { title: 'Out of Stock Products', value: kpis.outOfStockCount, desc: 'Products with stock = 0 items', icon: Cpu, trend: 'Archived from site', pos: false },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-1 mb-8 select-none">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-zinc-800 dark:text-zinc-200" />
          Analytics Reporting Dashboard
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          In-depth catalog metrics, category value distributions, and dynamic inventory insights.
        </p>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center min-h-[50vh]">
          <Loader size="lg" />
        </div>
      ) : errorMsg ? (
        <div className="max-w-md mx-auto text-center py-12 flex flex-col items-center gap-4">
          <ShieldAlert className="h-12 w-12 text-red-500" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Reporting Interrupted</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{errorMsg}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpiConfigs.map((cfg) => {
              const Icon = cfg.icon;
              return (
                <Card key={cfg.title} className="hover:shadow-xs transition-shadow duration-200 py-4.5 px-5">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-400 uppercase tracking-widest leading-none">
                        {cfg.title}
                      </span>
                      <span className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2 leading-none">
                        {cfg.value}
                      </span>
                    </div>
                    <div className="h-8.5 w-8.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-350">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 text-[10px] font-bold select-none border-t border-zinc-100/50 pt-2.5 dark:border-zinc-900/60 leading-none">
                    <span className="text-zinc-400 font-semibold truncate pr-2 leading-none">
                      {cfg.desc}
                    </span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md leading-none ${
                      cfg.pos 
                        ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-450' 
                        : 'text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-450'
                    }`}>
                      {cfg.trend}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card title="Category Product Distribution" subtitle="Item ratios per directory folder">
                <div className="h-64 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistributionData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconSize={10} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', fontWeight: '605', paddingTop: '15px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Products per Category" subtitle="Total distinct item catalogs count">
                <div className="h-64 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productsPerCategoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 600 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Products" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Average Rating by Category" subtitle="Weighted customer ratings per folder">
                <div className="h-64 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={avgRatingByCategoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 600 }} tickLine={false} />
                      <YAxis domain={[3.5, 5]} tick={{ fontSize: 9 }} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="Rating" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 1.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Inventory Value by Category" subtitle="Directory category value calculation ($)">
                <div className="h-64 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical" 
                      data={inventoryValueByCategoryData} 
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                      <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 8, fontWeight: 600 }} width={80} tickLine={false} />
                      <Tooltip content={<CustomTooltip valType="currency" />} />
                      <Bar dataKey="Value" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

            </div>

            <div className="lg:col-span-4 flex flex-col">
              <Card 
                title="Business Insights" 
                subtitle="Derived catalog telemetry trends"
                className="flex-1 flex flex-col justify-between"
              >
                <div className="flex flex-col gap-4.5 mt-2">
                  {businessInsights.map((insight) => (
                    <div 
                      key={insight.title}
                      className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 dark:border-zinc-850 dark:bg-zinc-900/10 dark:hover:bg-zinc-900/20 transition-colors"
                    >
                      <div className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        insight.type === 'positive' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                          : insight.type === 'negative'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-850 dark:text-zinc-400'
                      }`}>
                        {insight.type === 'positive' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : insight.type === 'negative' ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="flex flex-col flex-grow min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                            {insight.title}
                          </span>
                          <span className={`text-[10px] font-black tracking-wide ${
                            insight.type === 'positive' 
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : insight.type === 'negative'
                              ? 'text-rose-600 dark:text-rose-455'
                              : 'text-zinc-650 dark:text-zinc-300'
                          }`}>
                            {insight.metric}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-1 truncate">
                          {insight.category}
                        </span>
                        <p className="text-[11px] text-zinc-450 dark:text-zinc-500 leading-normal font-semibold mt-1">
                          {insight.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>

          <div className="flex flex-col mt-2">
            <TableContainer title="Top Rated Products Catalog">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-150 dark:bg-zinc-900/40 dark:border-zinc-800 text-xs font-bold text-zinc-400 uppercase select-none">
                  <th className="px-6 py-4 w-20">Preview</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center w-28">Rating Score</th>
                  <th className="px-6 py-4 text-right w-36">List Price</th>
                  <th className="px-6 py-4 w-40">Available Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {topRatedItems.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-900/20 transition-colors duration-150">
                    <td className="px-6 py-3">
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="h-10 w-10 rounded-lg bg-zinc-100 border border-zinc-200/50 dark:border-zinc-800 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&q=80';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-zinc-800 dark:text-zinc-200">
                      <Link href={`/products/${p.id}`} className="hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold capitalize bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200/20 dark:border-zinc-800 px-2 py-0.5 rounded-md">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-extrabold text-zinc-905 dark:text-white">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-zinc-900 dark:text-zinc-100">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {p.stock === 0 ? (
                        <Badge variant="error" className="text-[9px] uppercase font-bold tracking-wider">Out of Stock</Badge>
                      ) : p.stock <= 10 ? (
                        <Badge variant="warning" className="text-[9px] uppercase font-bold tracking-wider">Low Stock ({p.stock})</Badge>
                      ) : (
                        <Badge variant="success" className="text-[9px] uppercase font-bold tracking-wider">{p.stock} units</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableContainer>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
