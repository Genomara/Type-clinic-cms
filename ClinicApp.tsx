import React, { useState } from 'react';

// Import the components we built in previous steps (Conceptual)
// import PatientIntake from './PatientIntake';
// import BillingQueue from './BillingQueue';
// import OrderPad from './OrderPad';
// import DispensingDashboard from './DispensingDashboard';
// import AdminDashboard from './AdminDashboard';

const ClinicApp = () => {
  const [userRole, setUserRole] = useState(null); // 'receptionist' | 'doctor' | 'pharmacy' | 'admin'
  const [activeTab, setActiveTab] = useState('home');

  // 1. Role Selection Screen (Splash)
  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center p-8">
        <div className="mb-12 text-center">
          <h1 className="text-amber-500 font-black tracking-widest uppercase text-xs mb-2">Clinic CMS V2</h1>
          <p className="text-3xl text-white font-light">Select Your Station</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: 'receptionist', label: 'Reception & Billing', color: 'bg-emerald-600' },
            { id: 'doctor', label: 'Consultation Room', color: 'bg-blue-600' },
            { id: 'pharmacy', label: 'Pharmacy / Lab', color: 'bg-indigo-600' },
            { id: 'admin', label: 'Executive Admin', color: 'bg-amber-600' },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => { setUserRole(role.id); setActiveTab(role.id); }}
              className={`${role.color} text-white p-6 rounded-3xl font-bold text-lg shadow-xl active:scale-95 transition-transform`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Main Layout with Bottom Nav
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* Dynamic View Rendering */}
      <main className="animate-in fade-in duration-500">
        {activeTab === 'receptionist' && <div className="p-4"> {/* <PatientIntake /> & <BillingQueue /> */} <h1 className="text-2xl font-bold">Reception View</h1> </div>}
        {activeTab === 'doctor' && <div className="p-4"> {/* <OrderPad /> */} <h1 className="text-2xl font-bold">Doctor View</h1> </div>}
        {activeTab === 'pharmacy' && <div className="p-4"> {/* <DispensingDashboard /> */} <h1 className="text-2xl font-bold">Pharmacy View</h1> </div>}
        {activeTab === 'admin' && <div className="p-4"> {/* <AdminDashboard /> */} <h1 className="text-2xl font-bold">Admin View</h1> </div>}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        
        <NavButton 
          active={activeTab === 'receptionist'} 
          onClick={() => setActiveTab('receptionist')}
          label="Front Desk"
          icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
        
        <NavButton 
          active={activeTab === 'doctor'} 
          onClick={() => setActiveTab('doctor')}
          label="Consult"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />

        <NavButton 
          active={activeTab === 'pharmacy'} 
          onClick={() => setActiveTab('pharmacy')}
          label="Dispense"
          icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.823.362l-1.17.976a1 1 0 00.35 1.726l1.482.355a2 2 0 001.595-.171l.822-.439a2 2 0 011.628-.083l2.811.69a2 2 0 001.404 0l2.811-.69a2 2 0 011.628.083l.822.439a2 2 0 001.595.171l1.482-.355a1 1 0 00.35-1.726l-1.17-.976z"
        />

        <NavButton 
          active={activeTab === 'admin'} 
          onClick={() => setActiveTab('admin')}
          label="Admin"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />

        <button 
          onClick={() => setUserRole(null)}
          className="flex flex-col items-center text-slate-400 p-2"
        >
          <div className="h-5 w-5 border-2 border-slate-300 rounded-sm"></div>
          <span className="text-[10px] mt-1 font-bold">Exit</span>
        </button>
      </nav>
    </div>
  );
};

// Reusable Nav Button Component
const NavButton = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center transition-all ${active ? 'text-blue-600' : 'text-slate-400'}`}
  >
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
    </svg>
    <span className={`text-[10px] mt-1 font-bold ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    {active && <div className="h-1 w-1 bg-blue-600 rounded-full mt-1"></div>}
  </button>
);

export default ClinicApp;
import React from 'react';
import { createRoot } from 'react-dom/client';

// This is the "Mounting" logic that makes the app visible
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ClinicApp />);
}

export default ClinicApp;
