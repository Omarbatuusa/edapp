'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, CheckCircle, X, Save } from 'lucide-react';

type CardType = 'INFO' | 'REQUIREMENT' | 'STEP' | 'GATE';

interface Card {
  id: string;
  title: string;
  description?: string;
  card_type: CardType;
  sort_order: number;
  is_published: boolean;
  published_at?: string;
}

const TYPE_COLORS: Record<CardType, string> = {
  INFO: 'bg-blue-50 text-blue-700 border-blue-200',
  REQUIREMENT: 'bg-amber-50 text-amber-700 border-amber-200',
  STEP: 'bg-green-50 text-green-700 border-green-200',
  GATE: 'bg-red-50 text-red-700 border-red-200',
};

interface Props { tenantId: string }

export default function AdmissionsBuilder({ tenantId }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; card_type: CardType }>({ title: '', description: '', card_type: 'STEP' });
  const [addMode, setAddMode] = useState(false);
  const [newCard, setNewCard] = useState<{ title: string; description: string; card_type: CardType }>({ title: '', description: '', card_type: 'STEP' });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('session_token') || '';
  const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

  async function fetchCards() {
    const res = await fetch(`/v1/admin/tenants/${tenantId}/admissions`, { headers: authHeaders() });
    if (res.ok) setCards(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchCards(); }, [tenantId]);

  async function addCard() {
    if (!newCard.title) return;
    setSaving(true);
    const res = await fetch(`/v1/admin/tenants/${tenantId}/admissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(newCard),
    });
    if (res.ok) { setAddMode(false); setNewCard({ title: '', description: '', card_type: 'STEP' }); fetchCards(); }
    setSaving(false);
  }

  async function saveEdit(cardId: string) {
    setSaving(true);
    await fetch(`/v1/admin/tenants/${tenantId}/admissions/${cardId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    fetchCards();
    setSaving(false);
  }

  async function deleteCard(cardId: string) {
    if (!confirm('Delete this card?')) return;
    await fetch(`/v1/admin/tenants/${tenantId}/admissions/${cardId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    fetchCards();
  }

  async function publish() {
    setPublishing(true);
    const res = await fetch(`/v1/admin/tenants/${tenantId}/admissions/publish`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (res.ok) fetchCards();
    setPublishing(false);
  }

  const isPublished = cards.every(c => c.is_published) && cards.length > 0;

  if (loading) return <div className="p-8 text-center text-muted-foreground text-sm">Loading admissions process...</div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{cards.length} cards · {isPublished ? '✅ Published' : 'Draft'}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setAddMode(true); setEditingId(null); }} className="h-9 px-3 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5">
            <Plus size={16} /> Add Card
          </button>
          <button onClick={publish} disabled={publishing || cards.length === 0} className="h-9 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2">
            <CheckCircle size={16} /> {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Add new card form */}
      {addMode && (
        <div className="surface-card p-4 border-2 border-primary/20 space-y-3">
          <p className="text-sm font-semibold">New Card</p>
          <input value={newCard.title} onChange={e => setNewCard(n => ({ ...n, title: e.target.value }))} placeholder="Card title" className="input-field w-full" />
          <textarea value={newCard.description} onChange={e => setNewCard(n => ({ ...n, description: e.target.value }))} placeholder="Description (optional)" rows={2} className="input-field w-full resize-none" />
          <select value={newCard.card_type} onChange={e => setNewCard(n => ({ ...n, card_type: e.target.value as CardType }))} className="input-field">
            <option value="INFO">Info</option>
            <option value="REQUIREMENT">Requirement</option>
            <option value="STEP">Step</option>
            <option value="GATE">Gate (blocking)</option>
          </select>
          <div className="flex gap-2">
            <button onClick={addCard} disabled={saving} className="h-8 px-3 bg-primary text-primary-foreground text-xs rounded-lg">Save</button>
            <button onClick={() => setAddMode(false)} className="h-8 px-3 border border-border text-xs rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {/* Cards list */}
      <div className="space-y-2">
        {cards.map((card, idx) => (
          <div key={card.id} className="surface-card border border-border overflow-hidden">
            {editingId === card.id ? (
              <div className="p-4 space-y-3">
                <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} className="input-field w-full font-medium" />
                <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field w-full resize-none text-sm" />
                <select value={editForm.card_type} onChange={e => setEditForm(f => ({ ...f, card_type: e.target.value as CardType }))} className="input-field text-sm">
                  <option value="INFO">Info</option>
                  <option value="REQUIREMENT">Requirement</option>
                  <option value="STEP">Step</option>
                  <option value="GATE">Gate (blocking)</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(card.id)} disabled={saving} className="h-8 px-3 bg-primary text-primary-foreground text-xs rounded-lg flex items-center gap-1"><Save size={12} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="h-8 px-3 border border-border text-xs rounded-lg">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4">
                <GripVertical size={16} className="text-muted-foreground/40 mt-1 cursor-grab flex-shrink-0" />
                <div className="text-sm font-semibold text-muted-foreground w-6 mt-0.5 flex-shrink-0">{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{card.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[card.card_type]}`}>{card.card_type}</span>
                    {card.is_published && <span className="text-xs text-green-600">✓</span>}
                  </div>
                  {card.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => { setEditingId(card.id); setEditForm({ title: card.title, description: card.description || '', card_type: card.card_type }); }} className="p-1.5 rounded hover:bg-muted transition-colors">
                    <Edit2 size={14} className="text-muted-foreground" />
                  </button>
                  <button onClick={() => deleteCard(card.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {cards.length === 0 && (
          <div className="surface-card p-8 text-center text-muted-foreground text-sm border-dashed border-2 border-border">
            No admissions cards yet. Add your first card to get started.
          </div>
        )}
      </div>
    </div>
  );
}
