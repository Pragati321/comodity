"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Box, Ruler } from 'lucide-react';
import { ManagedCommodity } from '@/lib/types';

export function CommodityManagement() {
  const [commodities, setCommodities] = useState<ManagedCommodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ManagedCommodity>({ slug: '', name: '', unit: '', relevance: '' });
  const [isAdding, setIsAdding] = useState(false);

  const fetchCommodities = async () => {
    try {
      const response = await fetch('https://commodity-backend-694682127859.asia-south2.run.app/api/management/commodities');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch commodities:', error);
      return [];
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const data = await fetchCommodities();
      if (mounted && data) {
        setCommodities(Array.isArray(data) ? data : []);
      }
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleEdit = (commodity: ManagedCommodity) => {
    setEditingSlug(commodity.slug);
    setEditForm(commodity);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('https://commodity-backend-694682127859.asia-south2.run.app/api/management/commodities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        const data = await fetchCommodities();
        setCommodities(data);
        setEditingSlug(null);
        setIsAdding(false);
      }
    } catch (error) {
      console.error('Failed to save commodity:', error);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete ${slug}? This will remove all history and analysis.`)) return;
    try {
      const response = await fetch(`https://commodity-backend-694682127859.asia-south2.run.app/api/management/commodities/${slug}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const data = await fetchCommodities();
        setCommodities(data);
      }
    } catch (error) {
      console.error('Failed to delete commodity:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Box className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
            Commodity Catalog
          </h2>
        </div>
        {!isAdding && (
          <button 
            onClick={() => {
              setIsAdding(true);
              setEditForm({ slug: '', name: '', unit: 'USD/ton', relevance: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Material
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isAdding && (
          <div className="glass-card rounded-2xl p-6 border-2 border-primary/30 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-black uppercase text-sm tracking-widest text-primary mb-4">New Commodity Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Unique Slug (ID)</label>
                <input 
                  type="text" 
                  placeholder="e.g., silicon-dioxide"
                  value={editForm.slug}
                  onChange={e => setEditForm({...editForm, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Display Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., High Purity Silica"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Pricing Unit</label>
                <input 
                  type="text" 
                  placeholder="e.g., USD/ton"
                  value={editForm.unit}
                  onChange={e => setEditForm({...editForm, unit: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] uppercase font-black text-muted-foreground ml-1">Optical Fibre Relevance</label>
                <textarea 
                  placeholder="Explain why this material is critical for fibre manufacturing..."
                  value={editForm.relevance}
                  onChange={e => setEditForm({...editForm, relevance: e.target.value})}
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-24 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl hover:bg-secondary transition-all font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!editForm.slug || !editForm.name}
                className="px-6 py-2 rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest disabled:opacity-50 transition-all"
              >
                Deploy Profile
              </button>
            </div>
          </div>
        )}

        {commodities.map(commodity => (
          <div key={commodity.slug} className="glass-card rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-all group">
            {editingSlug === commodity.slug ? (
              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-muted-foreground">Display Name</label>
                    <input 
                      type="text" 
                      value={editForm.name}
                      onChange={e => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-muted-foreground">Pricing Unit</label>
                    <input 
                      type="text" 
                      value={editForm.unit}
                      onChange={e => setEditForm({...editForm, unit: e.target.value})}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] uppercase font-black text-muted-foreground">Relevance</label>
                    <textarea 
                      value={editForm.relevance}
                      onChange={e => setEditForm({...editForm, relevance: e.target.value})}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm h-20 resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingSlug(null)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><X className="h-4 w-4"/></button>
                  <button onClick={handleSave} className="p-2 rounded-lg bg-primary/20 text-primary"><Save className="h-4 w-4"/></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:bg-primary/5 transition-all">
                    <Box className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-foreground uppercase tracking-tight">{commodity.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground">{commodity.slug}</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        <Ruler className="h-3 w-3" /> {commodity.unit}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1 max-w-md">{commodity.relevance}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleEdit(commodity)}
                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(commodity.slug)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-muted-foreground font-medium italic">Loading terminal assets...</div>}
      {!loading && commodities.length === 0 && (
        <div className="text-center py-12 glass-card rounded-3xl border-dashed border-2 border-border text-muted-foreground italic">
          No commodities registered in the terminal.
        </div>
      )}
    </div>
  );
}
