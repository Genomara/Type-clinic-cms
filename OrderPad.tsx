import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_URL', 'YOUR_KEY');

const OrderPad = ({ visitId, patientName }) => {
  const [query, setQuery] = useState('');
  const [inventory, setInventory] = useState([]);
  const [basket, setBasket] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search inventory as the doctor types
  useEffect(() => {
    if (query.length < 2) {
      setInventory([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      const { data } = await supabase
        .from('inventory')
        .select('id, item_name, unit_price, current_stock, category')
        .ilike('item_name', `%${query}%`)
        .limit(5);
      setInventory(data || []);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const addToBasket = (item) => {
    const existing = basket.find(i => i.id === item.id);
    if (existing) {
      setBasket(basket.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setBasket([...basket, { ...item, qty: 1 }]);
    }
    setQuery('');
    setInventory([]);
  };

  const submitOrder = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Clinical Orders
      const orders = basket.map(item => ({
        visit_id: visitId,
        inventory_id: item.id,
        quantity: item.qty,
        order_status: 'pending_payment',
        ordered_by: 'CURRENT_DOCTOR_ID' // Replace with Auth context
      }));

      const { error: orderError } = await supabase.from('clinical_orders').insert(orders);
      if (orderError) throw orderError;

      // 2. Update Visit Status to 'awaiting_payment'
      const { error: visitError } = await supabase
        .from('visits')
        .update({ status: 'awaiting_payment' })
        .eq('id', visitId);

      if (visitError) throw visitError;

      alert("Orders sent to Billing.");
      setBasket([]);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white min-h-screen">
      <header className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-tight">Consultation For</h2>
        <p className="text-xl font-bold text-slate-900">{patientName}</p>
      </header>

      {/* Search Bar */}
      <div className="relative mb-8">
        <input
          type="text"
          value={query}
          placeholder="Search drug or lab test..."
          className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 transition outline-none text-lg"
          onChange={(e) => setQuery(e.target.value)}
        />
        
        {inventory.length > 0 && (
          <div className="absolute w-full mt-2 bg-white shadow-2xl rounded-2xl border border-slate-100 z-50 overflow-hidden">
            {inventory.map(item => (
              <button
                key={item.id}
                onClick={() => addToBasket(item)}
                className="w-full text-left p-4 hover:bg-blue-50 border-b border-slate-50 last:border-0 flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-slate-800">{item.item_name}</p>
                  <p className="text-xs text-slate-500 uppercase">{item.category.replace('_', ' ')}</p>
                </div>
                <p className="text-blue-600 font-bold">${item.unit_price}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current Prescription Basket */}
      <div className="space-y-3 mb-24">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          Current Order {basket.length > 0 && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px]">{basket.length}</span>}
        </h3>
        
        {basket.map(item => (
          <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
            <div>
              <p className="font-bold text-slate-800">{item.item_name}</p>
              <p className="text-xs text-slate-500">Qty: {item.qty}</p>
            </div>
            <button 
              onClick={() => setBasket(basket.filter(i => i.id !== item.id))}
              className="text-red-400 p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Final Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100">
        <button
          disabled={basket.length === 0 || isSubmitting}
          onClick={submitOrder}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          {isSubmitting ? 'Sending...' : 'Send to Billing'}
        </button>
      </div>
    </div>
  );
};

export default OrderPad;
        
