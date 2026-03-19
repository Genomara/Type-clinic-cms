import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_URL', 'YOUR_KEY');

const QuickSaleModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [inventory, setInventory] = useState([]);
  const [basket, setBasket] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Search inventory (Only items with stock > 0)
  useEffect(() => {
    if (query.length < 2) return setInventory([]);
    const search = async () => {
      const { data } = await supabase
        .from('inventory')
        .select('id, item_name, unit_price, current_stock')
        .ilike('item_name', `%${query}%`)
        .gt('current_stock', 0)
        .limit(5);
      setInventory(data || []);
    };
    search();
  }, [query]);

  const handleCompleteSale = async () => {
    setIsProcessing(true);
    try {
      // 1. Create a "Walk-in" Patient entry
      const { data: patient, error: pError } = await supabase
        .from('patients')
        .insert([{ first_name: 'Walk-in', last_name: 'Customer', payment_type: 'cash' }])
        .select().single();
      if (pError) throw pError;

      // 2. Create a Visit (Immediately set to 'completed')
      const { data: visit, error: vError } = await supabase
        .from('visits')
        .insert([{ patient_id: patient.id, status: 'completed' }])
        .select().single();
      if (vError) throw vError;

      for (const item of basket) {
        // 3. Create Paid Clinical Order
        const { data: order, error: oError } = await supabase
          .from('clinical_orders')
          .insert([{
            visit_id: visit.id,
            inventory_id: item.id,
            quantity: item.qty,
            order_status: 'paid',
            ordered_by: 'RECEPTION_ID' // Current user
          }]).select().single();
        if (oError) throw oError;

        // 4. Create Transaction
        await supabase.from('transactions').insert([{
          visit_id: visit.id,
          clinical_order_id: order.id,
          total_charged: item.unit_price * item.qty,
          payment_method: 'cash',
          processed_by: 'RECEPTION_ID'
        }]);

        // 5. Decrement Inventory
        await supabase.rpc('decrement_inventory', { 
          row_id: item.id, 
          amount: item.qty 
        });
      }

      alert("OTC Sale Complete. Receipt Generated.");
      setBasket([]);
      onClose();
    } catch (err) {
      alert("Sale failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
          <div>
            <h2 className="text-xl font-black text-emerald-900">Quick Sale (OTC)</h2>
            <p className="text-xs text-emerald-600 font-bold uppercase tracking-tight">Direct Inventory Checkout</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full shadow-sm text-slate-400">✕</button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search item..."
              className="w-full p-4 bg-slate-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={(e) => setQuery(e.target.value)}
            />
            {inventory.length > 0 && (
              <div className="absolute w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-10">
                {inventory.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      setBasket([...basket, { ...item, qty: 1 }]);
                      setInventory([]);
                      setQuery('');
                    }}
                    className="w-full text-left p-4 hover:bg-emerald-50 border-b border-slate-50 last:border-0 flex justify-between"
                  >
                    <span className="font-bold">{item.item_name}</span>
                    <span className="text-emerald-600 font-bold">${item.unit_price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Basket */}
          <div className="space-y-3">
            {basket.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">{item.item_name}</p>
                  <p className="text-xs text-slate-500">${item.unit_price} x {item.qty}</p>
                </div>
                <div className="flex items-center gap-3">
                   <span className="font-black text-slate-900">${(item.unit_price * item.qty).toFixed(2)}</span>
                   <button onClick={() => setBasket(basket.filter((_, i) => i !== idx))} className="text-red-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4 px-2">
            <span className="text-slate-500 font-bold">Total Due</span>
            <span className="text-2xl font-black text-slate-900">
              ${basket.reduce((acc, item) => acc + (item.unit_price * item.qty), 0).toFixed(2)}
            </span>
          </div>
          <button
            disabled={basket.length === 0 || isProcessing}
            onClick={handleCompleteSale}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 disabled:bg-slate-300 transition-all active:scale-95"
          >
            {isProcessing ? 'Processing...' : 'Complete Sale & Print Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickSaleModal;
                      
