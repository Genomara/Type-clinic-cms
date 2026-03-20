import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_URL', 'YOUR_KEY');

const BillingQueue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    // Fetch orders joined with patient and inventory info
    const { data, error } = await supabase
      .from('clinical_orders')
      .select(`
        id,
        quantity,
        visit_id,
        inventory_id,
        inventory (item_name, unit_price),
        visits (patient_id, patients (first_name, last_name))
      `)
      .eq('order_status', 'pending_payment');

    if (!error) setOrders(data);
    setLoading(false);
  };

  const handlePayment = async (order) => {
    const total = order.inventory.unit_price * order.quantity;

    // We use a simple sequential update here, 
    // but in production, a Supabase RPC (Function) is safer for atomicity.
    try {
      // 1. Create Transaction record
      const { error: tError } = await supabase.from('transactions').insert([{
        visit_id: order.visit_id,
        clinical_order_id: order.id,
        total_charged: total,
        payment_method: 'cash', // Logic can be added here to toggle method
        processed_by: 'CURRENT_STAFF_ID' // Replace with Auth ID
      }]);

      if (tError) throw tError;

      // 2. Mark Order as Paid
      const { error: oError } = await supabase
        .from('clinical_orders')
        .update({ order_status: 'paid' })
        .eq('id', order.id);

      if (oError) throw oError;

      // Refresh list
      setOrders(orders.filter(item => item.id !== order.id));
      alert('Payment Confirmed Successfully');
    } catch (err) {
      alert('Payment failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Billing Queue</h1>
        <p className="text-slate-500 text-sm">{orders.length} payments pending</p>
      </header>

      <div className="space-y-4">
        {loading ? <p>Loading queue...</p> : orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Patient</span>
                <h3 className="text-lg font-bold text-slate-900">
                  {order.visits.patients.first_name} {order.visits.patients.last_name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Due</span>
                <p className="text-xl font-black text-slate-900">
                  ${(order.inventory.unit_price * order.quantity).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 mb-5 flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">{order.inventory.item_name}</span>
              <span className="text-slate-400 text-xs font-bold">Qty: {order.quantity}</span>
            </div>

            <button
              onClick={() => handlePayment(order)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-100 transition-all flex justify-center items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Confirm Payment
            </button>
          </div>
        ))}

        {!loading && orders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400">All caught up! No pending payments.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingQueue;
