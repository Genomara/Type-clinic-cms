import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Assuming supabase client is initialized elsewhere
const supabase = createClient('YOUR_URL', 'YOUR_KEY');

const PatientIntake = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    paymentType: 'cash',
    schemeDetails: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Insert Patient
      const { data: patient, error: pError } = await supabase
        .from('patients')
        .insert([{
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
          payment_type: formData.paymentType,
          scheme_details: formData.schemeDetails
        }])
        .select()
        .single();

      if (pError) throw pError;

      // 2. Start Visit (Status: Waiting)
      const { error: vError } = await supabase
        .from('visits')
        .insert([{
          patient_id: patient.id,
          status: 'waiting'
        }]);

      if (vError) throw vError;

      alert('Patient Registered & Put in Queue');
      // Reset form or redirect
    } catch (err) {
      console.error(err);
      alert('Error processing intake');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 p-6">
          <h2 className="text-xl font-bold text-white">New Patient Intake</h2>
          <p className="text-blue-100 text-sm">Register patient and start clinical visit</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Section */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">First Name</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="John"
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Last Name</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                placeholder="Doe"
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
            <input 
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="+265..."
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            />
          </div>

          {/* Payment Type - The Anti-Leakage Pivot */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Payment Method</label>
            <select 
              value={formData.paymentType}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
            >
              <option value="cash">Cash (Upfront)</option>
              <option value="insurance">Insurance</option>
              <option value="corporate_scheme">Corporate Scheme</option>
            </select>
          </div>

          {/* Conditional Scheme Details */}
          {formData.paymentType !== 'cash' && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Scheme/Member ID</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-500 outline-none transition"
                placeholder="e.g. MASM - #12345"
                onChange={(e) => setFormData({...formData, schemeDetails: e.target.value})}
              />
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Register & Start Visit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientIntake;
