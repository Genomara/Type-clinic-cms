import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';

// Connection to your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ClinicApp = () => {
  const [view, setView] = useState('welcome');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <h1 className="font-black text-xl tracking-tighter text-blue-600">CLINIC<span className="text-slate-400">CMS</span></h1>
        <div className="flex gap-2">
          <button onClick={() => setView('staff')} className="px-4 py-2 text-sm font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition">Staff Login</button>
          <button onClick={() => setView('admin')} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">Admin</button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-4 max-w-lg mx-auto mt-8">
        {view === 'welcome' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xl">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold">🏥</span>
            </div>
            <h2 className="text-2xl font-black mb-2">Systems Ready</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">The database is connected. Choose a station to begin managing the clinic.</p>
            
            <div className="space-y-3">
              <button onClick={() => setView('reception')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-left flex justify-between items-center hover:border-blue-400 transition">
                <span>Receptionist Intake</span>
                <span className="text-blue-500">→</span>
              </button>
              <button onClick={() => setView('inventory')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-left flex justify-between items-center hover:border-blue-400 transition">
                <span>Inventory & Pharmacy</span>
                <span className="text-blue-500">→</span>
              </button>
              <button onClick={() => setView('billing')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-left flex justify-between items-center hover:border-blue-400 transition">
                <span>Billing Queue</span>
                <span className="text-blue-500">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Placeholder for Station Views */}
        {view !== 'welcome' && (
          <div className="text-center">
            <p className="text-slate-400 mb-4">You clicked on {view} view.</p>
            <button onClick={() => setView('welcome')} className="text-blue-600 font-bold">← Back to Home</button>
          </div>
        )}
      </main>
    </div>
  );
};

// Final Bridge
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ClinicApp />);
}

export default ClinicApp;
  
