import React from 'react';
import { Play, Settings, Activity, Eye, Layout, Layers } from 'lucide-react';

export default function UXApproachesDemo() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Alternative UX Approaches for Monitor Control</h1>

      {/* Approach 1: Integrated into Consumer Groups Table */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Approach 1: Integrated Table Actions
        </h2>
        <p className="text-white/70 mb-4">Quick actions directly in each consumer group row</p>
        <div className="bg-white/5 rounded-lg p-4">
          <table className="w-full">
            <thead>
              <tr className="text-white/70 text-sm">
                <th className="text-left pb-2">Group Name</th>
                <th className="text-left pb-2">Current Lag</th>
                <th className="text-left pb-2">Monitor Status</th>
                <th className="text-right pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10">
                <td className="py-3 text-white">payment-processor</td>
                <td className="py-3 text-amber-400">22</td>
                <td className="py-3">
                  <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                    Active (Threshold: 100)
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-sm hover:bg-rose-500/30">
                    Stop
                  </button>
                </td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="py-3 text-white">analytics-pipeline</td>
                <td className="py-3 text-rose-400">300</td>
                <td className="py-3 text-white/50">Not monitored</td>
                <td className="py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <input 
                      type="number" 
                      placeholder="Threshold" 
                      className="w-24 px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-sm"
                    />
                    <button className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30">
                      Start
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Approach 2: Floating Action Button with Modal */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Approach 2: Floating Action Button
        </h2>
        <p className="text-white/70 mb-4">Clean interface with modal-based configuration</p>
        <div className="bg-white/5 rounded-lg p-8 relative">
          <p className="text-white/50 text-center">Main dashboard content...</p>
          <div className="fixed bottom-8 right-8 flex flex-col gap-3 items-end">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
              <h3 className="text-sm font-medium text-white mb-2">Active Monitors (2)</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Activity className="h-3 w-3 text-emerald-400" />
                  <span className="text-white/70">payment-processor</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Activity className="h-3 w-3 text-amber-400" />
                  <span className="text-white/70">notification-service</span>
                </div>
              </div>
            </div>
            <button className="p-4 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all">
              <Play className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Approach 3: Sidebar Panel */}
      <div className="backdrop-blur-xl bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Approach 3: Dedicated Sidebar
        </h2>
        <p className="text-white/70 mb-4">Persistent monitoring control panel</p>
        <div className="bg-white/5 rounded-lg overflow-hidden">
          <div className="flex">
            <div className="flex-1 p-8">
              <p className="text-white/50 text-center">Main dashboard content...</p>
            </div>
            <div className="w-80 bg-white/5 border-l border-white/10 p-4">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Monitor Control
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/70">Consumer Group</label>
                  <select className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm">
                    <option>payment-processor</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/70">Lag Threshold</label>
                  <input 
                    type="number" 
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                    placeholder="100"
                  />
                </div>
                <button className="w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/30">
                  Start Monitor
                </button>
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-xs text-white/70 mb-2">Active Monitors</h4>
                  <div className="space-y-2">
                    <div className="p-2 rounded bg-white/5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-white">analytics-pipeline</span>
                        <button className="text-rose-400 hover:text-rose-300">Stop</button>
                      </div>
                      <div className="text-white/50 mt-1">Threshold: 200 msgs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 