import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_URL', 'YOUR_KEY');

const DispensingDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaidOrders();
  }, []);

  const fetchPaidOrders = async () => {
    const { data, error } = await supabase
      .from('clinical_orders')
      .select(`
        id,
        quantity,
        inventory_id,
        inventory (item_name, current_stock, batch_number, category),
        visits (patients (first_name, last_name, phone_number))
      `)
      .eq('order_status', 'paid');

    if (!error) setOrders(data);
    setLoading(false);
  };

  const handleDispense = async (order) => {
    const newStock = order.inventory.current_stock - order.quantity;

    if (newStock < 0) {
      alert("Error: Insufficient stock to dispense this item.");
      return;
    }

    try {
      // 1. Update Inventory Stock
      const { error: invError } = await supabase
        .from('inventory')
        .update({ current_stock: newStock })
        .eq('id', order.inventory_id);

      if (invError) throw invError;

      // 2. Mark Order as Dispensed
      const { error: orderError } = await supabase
        .from('clinical_orders')
        .update({ 
          order_status: 'dispensed',
          // Assuming we have a dispensed_by column or using a log table
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      setOrders(orders.filter(o => o.id !== order.id));
      alert(`${order.inventory.item_name} dispensed successfully.`);
    } catch (err) {
      alert("Dispensing failed: " + err.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    const fullName = `${order.visits.patients.first_name} ${order.visits.patients.last_name}`.toLowerCase();
    const phone = order.visits.patients.phone_number || '';
    return fullName.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm);
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header & Search */}
      <div className="bg-blue-700 p-6 sticky top-0 z-10 shadow-lg">
        <h1 className="text-white text-2xl font-bold mb-4">Dispensing Queue</h1>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-blue-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text"
            placeholder="Search patient name or phone..."
            className="w-full bg-blue-800 text-white placeholder-blue-300 border-none rounded-xl py-3 pl-10 focus:ring-2 focus:ring-white outline-none transition"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? <p className="text-center py-10">Syncing with Pharmacy...</p> : filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-blue-50 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-blue-50/30">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase">Patient</p>
                <h2 className="font-bold text-slate-800">
                  {order.visits.patients.first_name} {order.visits.patients.last_name}
                </h2>
              </div>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                {order.inventory.category.replace('_', ' ')}
              </span>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-medium text-slate-600">{order.inventory.item_name}</p>
                  <p className="text-xs text-slate-400">Batch: {order.inventory.batch_number || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase">Qty to Issue</p>
                  <p className="text-2xl font-black text-blue-700">{order.quantity}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex gap-3">
                <button 
                  onClick={() => handleDispense(order)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 shadow-md shadow-blue-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Dispense Item
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {!loading && filteredOrders.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            No items ready for dispensing.
          </div>
        )}
      </div>
    </div>
  );
};

export default DispensingDashboard;
                  
