import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_URL', 'YOUR_KEY');

const AdminDashboard = () => {
  const [stats, setStats] = useState({ revenue: 0, patients: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [pendingAdjustments, setPendingAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch Today's Revenue
    const { data: revenueData } = await supabase
      .from('transactions')
      .select('total_charged')
      .gte('transaction_time', today);
    
    const totalRev = revenueData?.reduce((acc, curr) => acc + Number(curr.total_charged), 0) || 0;

    // 2. Fetch Today's Patient Count
    const { count } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .gte('visit_date', today);

    // 3. Fetch Low Stock (< 10)
    const { data: stockData } = await supabase
      .from('inventory')
      .select('item_name, current_stock')
      .lt('current_stock', 10);

    // 4. Fetch Pending Adjustments
    const { data: adjData } = await supabase
      .from('inventory_adjustments')
      .select(`
        id, quantity_changed, reason, 
        inventory(item_name), 
        staff(full_name)
      `)
      .is('approved_by_admin', null);

    setStats({ revenue: totalRev, patients: count || 0 });
    setLowStock(stockData || []);
    setPendingAdjustments(adjData || []);
    setLoading(false);
  };

  const approveAdjustment = async (adjId) => {
    const { error } = await supabase
      .from('inventory_adjustments')
      .update({ approved_by_admin: 'CURRENT_ADMIN_ID' }) // Replace with Auth ID
      .eq('id', adjId);

    if (!error) {
      setPendingAdjustments(prev => prev.filter(a => a.id !== adjId));
      alert("Adjustment Approved. Stock records finalized.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-12 font-sans">
      {/* Executive Header */}
      <header className="p-8 border-b border-slate-800 bg-[#1e293b]">
        <h1 className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Executive Overview</h1>
        <p className="text-3xl font-light text-white">Clinic Performance</p>
      </header>

      <main className="p-6 space-y-8 max-w-5xl mx-auto">
        
        {/* Daily Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase mb-2">Total Revenue (Today)</p>
            <p className="text-3xl font-black text-white">${stats.revenue.toLocaleString()}</p>
            <div className="mt-2 h-1 w-12 bg-amber-500 rounded-full"></div>
          </div>
          <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <p className="text-slate-400 text-xs font-bold uppercase mb-2">Patients Seen</p>
            <p className="text-3xl font-black text-white">{stats.patients}</p>
            <div className="mt-2 h-1 w-12 bg-amber-500 rounded-full"></div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            Critical Inventory Alerts
          </h2>
          <div className="bg-[#1e293b] rounded-3xl overflow-hidden border border-slate-800">
            {lowStock.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-4 border-b border-slate-800 last:border-0">
                <span className="text-sm font-medium">{item.item_name}</span>
                <span className="bg-red-500/10 text-red-500 text-xs font-bold px-3 py-1 rounded-full border border-red-500/20">
                  {item.current_stock} left
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Approval Queue */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Pending Waste/Adjustment Approvals</h2>
          <div className="space-y-3">
            {pendingAdjustments.map((adj) => (
              <div key={adj.id} className="bg-[#1e293b] p-5 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-white font-bold">{adj.inventory.item_name}</p>
                  <p className="text-xs text-slate-400">
                    Reason: <span className="text-amber-500">{adj.reason}</span> • By {adj.staff.full_name}
                  </p>
                  <p className="text-lg font-black mt-1 text-white">{adj.quantity_changed > 0 ? '+' : ''}{adj.quantity_changed} Units</p>
                </div>
                <button 
                  onClick={() => approveAdjustment(adj.id)}
                  className="bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-black px-6 py-3 rounded-2xl transition-all active:scale-95 text-sm shadow-lg shadow-amber-500/20"
                >
                  Approve
                </button>
              </div>
            ))}
            {pendingAdjustments.length === 0 && (
              <p className="text-slate-600 text-sm italic">No adjustments requiring attention.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;
        
