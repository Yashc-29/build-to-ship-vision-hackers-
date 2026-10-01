import React, { useState } from 'react';
import { Database, Plus, Check, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { MemorySlot } from '../../types';

interface MemoryBufferCardProps {
  memorySlots: MemorySlot[];
  onAddSlot: (key: string, value: string) => Promise<void>;
  className?: string;
}

export const MemoryBufferCard: React.FC<MemoryBufferCardProps> = ({
  memorySlots,
  onAddSlot,
  className = ''
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [slotKey, setSlotKey] = useState('');
  const [slotValue, setSlotValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotKey.trim() || !slotValue.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddSlot(slotKey.trim(), slotValue.trim());
      setSlotKey('');
      setSlotValue('');
      setShowAddForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`nebula-panel rounded-3xl p-5 shadow-xl flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-display">
              Persistent Memory Buffer
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/20 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Slot
          </button>
        </div>

        {/* Add Slot Form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="mb-3 p-3 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Slot Key (e.g. order_id)"
                value={slotKey}
                onChange={(e) => setSlotKey(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <input
                type="text"
                placeholder="Value (e.g. ORD-1029)"
                value={slotValue}
                onChange={(e) => setSlotValue(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-400 px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-xs px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold"
              >
                {isSubmitting ? 'Saving...' : 'Save Slot'}
              </button>
            </div>
          </form>
        )}

        {/* Memory Slots List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {memorySlots.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No active memory slots extracted yet. Slots populate automatically as user discusses orders, names, or account details.
            </div>
          ) : (
            memorySlots.map((slot, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs hover:border-indigo-500/30 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <Key className="w-3 h-3" />
                  </div>
                  <span className="font-mono text-slate-400 uppercase text-[11px] truncate">{slot.slot_key}:</span>
                  <span className="font-bold text-slate-100 truncate">{slot.slot_value}</span>
                </div>

                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 flex-shrink-0">
                  {Math.round((slot.confidence || 0.95) * 100)}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-white/10 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Active Memory Slots: {memorySlots.length}</span>
        <span className="text-indigo-400 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Synchronized Across Channels
        </span>
      </div>
    </div>
  );
};
