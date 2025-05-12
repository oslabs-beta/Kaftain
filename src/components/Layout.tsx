import React from 'react';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-700 via-teal-700 to-purple-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 
              className="text-2xl font-bold text-white cursor-pointer" 
              onClick={() => navigate('/')}
            >
              Kaftain Dashboard
            </h1>
          </div>
          <button 
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-lg transition-all border border-white/10"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5 text-white" />
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}