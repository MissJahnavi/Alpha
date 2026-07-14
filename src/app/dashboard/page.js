'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import TableContainer from '@/components/TableContainer';
import Badge from '@/components/ui/Badge';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Activity, 
  ArrowUpRight, 
  DollarSign, 
  Clock, 
  CheckCircle 
} from 'lucide-react';

/**
 * Admin Dashboard Page.
 * Displays overview analytics cards, recent system processes table,
 * and high-level charts mockups. Restricted to 'admin' role.
 */
export default function DashboardPage() {
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$48,259.80',
      change: '+12.5%',
      isPositive: true,
      subtitle: 'vs. last month',
      icon: DollarSign,
      color: 'indigo',
    },
    {
      title: 'Monthly Active Users',
      value: '12,482',
      change: '+8.2%',
      isPositive: true,
      subtitle: 'vs. last month',
      icon: Users,
      color: 'sky',
    },
    {
      title: 'Total Catalog Products',
      value: '1,540 Items',
      change: '+24 new',
      isPositive: true,
      subtitle: 'this week',
      icon: ShoppingBag,
      color: 'emerald',
    },
    {
      title: 'Active Event Rate',
      value: '99.98%',
      change: '-0.02%',
      isPositive: false,
      subtitle: 'vs. SLA target',
      icon: Activity,
      color: 'amber',
    },
  ];

  const recentActivities = [
    { id: 'TX-9842', user: 'Sarah Connor', action: 'Published Laptop Pro V2', time: '10 mins ago', status: 'completed' },
    { id: 'TX-9841', user: 'Alex Mercer', action: 'Updated Product Stock #44', time: '1 hour ago', status: 'completed' },
    { id: 'TX-9840', user: 'Sarah Connor', action: 'Unpublished Keyboard V1', time: '3 hours ago', status: 'pending' },
    { id: 'TX-9839', user: 'System Sync', action: 'Cleaned cache logs', time: '12 hours ago', status: 'completed' },
    { id: 'TX-9838', user: 'Alex Mercer', action: 'Created draft Camera 4K', time: '1 day ago', status: 'failed' },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="text-[10px] py-0 px-2 font-bold uppercase">Completed</Badge>;
      case 'pending':
        return <Badge variant="warning" className="text-[10px] py-0 px-2 font-bold uppercase">Pending</Badge>;
      case 'failed':
      default:
        return <Badge variant="error" className="text-[10px] py-0 px-2 font-bold uppercase">Failed</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Dashboard Overview
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Real-time metrics, system health logs, and administration shortcuts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="hover:translate-y-[-2px] transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {metric.title}
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
                    {metric.value}
                  </span>
                </div>
                <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold">
                <span className={`flex items-center gap-0.5 ${metric.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {metric.isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                  {metric.change}
                </span>
                <span className="text-zinc-450 dark:text-zinc-500">
                  {metric.subtitle}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 flex flex-col">
          <TableContainer 
            title="System Audit Log" 
            headerActions={
              <button className="text-xs font-bold text-indigo-650 hover:underline flex items-center gap-1 cursor-pointer">
                View all logs <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            }
            className="flex-1"
          >
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-150 dark:bg-zinc-900/50 dark:border-zinc-800 text-xs font-bold text-zinc-400 uppercase">
                <th className="px-6 py-3">Event ID</th>
                <th className="px-6 py-3">Admin User</th>
                <th className="px-6 py-3">Operation Details</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentActivities.map((act) => (
                <tr key={act.id} className="hover:bg-zinc-50/20 dark:hover:bg-zinc-900/20 transition-colors duration-150">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-300">{act.id}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300">{act.user}</td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">{act.action}</td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-450 dark:text-zinc-500">{act.time}</td>
                  <td className="px-6 py-4 text-right">{getStatusBadge(act.status)}</td>
                </tr>
              ))}
            </tbody>
          </TableContainer>
        </div>

        <div className="flex flex-col">
          <Card 
            title="Server Performance" 
            subtitle="Live engine telemetry report"
            className="h-full flex flex-col justify-between"
          >
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-500 dark:text-zinc-400">Core CPU Usage</span>
                  <span className="text-zinc-800 dark:text-zinc-200">24%</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-650 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-500 dark:text-zinc-400">Memory Allocation</span>
                  <span className="text-zinc-800 dark:text-zinc-200">5.8 GB / 16 GB</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-650 rounded-full" style={{ width: '36%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-500 dark:text-zinc-400">Response Latency</span>
                  <span className="text-zinc-800 dark:text-zinc-200">42ms</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 items-start p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-xl dark:bg-indigo-950/20 dark:border-indigo-900/30 mt-6">
              <CheckCircle className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col text-[11px] leading-tight text-indigo-900 dark:text-indigo-300">
                <span className="font-bold">System Status: Optimal</span>
                <span>All microservices online. Next cron runs in 4 minutes.</span>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
