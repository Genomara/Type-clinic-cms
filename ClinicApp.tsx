import React from 'react';
import { createRoot } from 'react-dom/client';

const ClinicApp = () => {
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Clinic CMS Live! 🚀</h1>
        <p className="text-slate-600">If you see this blue screen, your Vercel and GitHub are working perfectly.</p>
        <button 
          onClick={() => alert('Database Connection Active!')}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

// Mounting Logic
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ClinicApp />);
}

export default ClinicApp;
