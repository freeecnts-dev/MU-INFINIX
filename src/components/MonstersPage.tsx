import { useState, useEffect } from 'react';
import { supabase, type Monster } from '@/lib/supabase';
import { Plus, Pencil, Trash2, X, Skull, Search, Swords, Heart, Shield, AlertTriangle } from 'lucide-react';

type MonstersPageProps = {
  monsterCount: number;
  onCountChange: () => void;
};

export default function MonstersPage({ onCountChange }: MonstersPageProps) {
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Monster | null>(null);
  const [form, setForm] = useState({ name: '', level: '1', hp: '100', damage: '10' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Monster | null>(null);

  const fetchMonsters = async () => {
    setLoading(true);
    if (!supabase) { setError('Banco de dados não configurado.'); setLoading(false); return; }
    const { data, error } = await supabase.from('monsters').select('*').order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setMonsters(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMonsters();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', level: '1', hp: '100', damage: '10' });
    setError('');
    setModalOpen(true);
  };

  const openEdit = (m: Monster) => {
    setEditing(m);
    setForm({ name: m.name, level: String(m.level), hp: String(m.hp), damage: String(m.damage) });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const level = parseInt(form.level, 10);
    const hp = parseInt(form.hp, 10);
    const damage = parseInt(form.damage, 10);

    if (!name) { setError('Informe o nome do monstro.'); return; }
    if (isNaN(level) || level < 1) { setError('Nível deve ser um número maior que zero.'); return; }
    if (isNaN(hp) || hp < 1) { setError('Vida deve ser um número maior que zero.'); return; }
    if (isNaN(damage) || damage < 0) { setError('Dano deve ser um número válido.'); return; }

    if (!supabase) { setError('Banco de dados não configurado.'); return; }
    setSaving(true);
    setError('');

    if (editing) {
      const { error: err } = await supabase.from('monsters').update({ name, level, hp, damage }).eq('id', editing.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('monsters').insert({ name, level, hp, damage });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setModalOpen(false);
    onCountChange();
    fetchMonsters();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!supabase) { setError('Banco de dados não configurado.'); return; }
    const { error: err } = await supabase.from('monsters').delete().eq('id', deleteTarget.id);
    if (err) { setError(err.message); return; }
    setDeleteTarget(null);
    onCountChange();
    fetchMonsters();
  };

  const filtered = monsters.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Skull className="w-5 h-5 text-gold-400" />
            <span className="text-gold-600 text-[11px] font-display tracking-[0.2em] uppercase">Bestiário</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold gold-text-gradient">Gerenciar Monstros</h2>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 gold-gradient text-dark-900 font-display font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-gold-600/20"
        >
          <Plus className="w-4 h-4" />
          Novo Monstro
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-600" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-gold-600/30 rounded-lg text-gold-200 placeholder:text-gold-600/40 font-body text-sm focus:outline-none focus:border-gold-400 transition-colors"
        />
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-gold-200/40 font-display">Carregando monstros...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-dark-card border border-gold-600/20 rounded-xl">
          <Skull className="w-10 h-10 text-gold-600/40 mx-auto mb-3" />
          <p className="text-gold-200/40 font-display">
            {search ? 'Nenhum monstro encontrado.' : 'Nenhum monstro cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-dark-card border border-gold-600/30 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-600/30">
                  <th className="text-left px-6 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Nome</th>
                  <th className="text-left px-6 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Nível</th>
                  <th className="text-left px-6 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Vida</th>
                  <th className="text-left px-6 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Dano</th>
                  <th className="text-right px-6 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-gold-600/10 hover:bg-dark-700/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-dark-700 border border-gold-600/20 flex items-center justify-center">
                          <Skull className="w-4 h-4 text-gold-600" />
                        </div>
                        <span className="font-display text-gold-200 font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gold-200/70 font-body">{m.level}</td>
                    <td className="px-6 py-4">
                      <span className="text-red-400 font-body">{m.hp}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-orange-400 font-body">{m.damage}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(m)}
                          className="p-2 rounded-md text-gold-600 hover:text-gold-400 hover:bg-dark-700 transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="p-2 rounded-md text-red-600 hover:text-red-400 hover:bg-dark-700 transition-colors"
                          aria-label="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((m) => (
              <div key={m.id} className="bg-dark-card border border-gold-600/30 rounded-xl p-4 fade-in">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-dark-700 border border-gold-600/20 flex items-center justify-center">
                      <Skull className="w-4 h-4 text-gold-600" />
                    </div>
                    <div>
                      <p className="font-display text-gold-200 font-medium">{m.name}</p>
                      <p className="text-gold-600 text-xs font-display">Nível {m.level}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(m)}
                      className="p-2 rounded-md text-gold-600 hover:text-gold-400 hover:bg-dark-700 transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(m)}
                      className="p-2 rounded-md text-red-600 hover:text-red-400 hover:bg-dark-700 transition-colors"
                      aria-label="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-dark-700/50 rounded-lg p-2.5 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-gold-600 text-[10px] font-display uppercase">Vida</p>
                      <p className="text-red-400 font-body font-semibold">{m.hp}</p>
                    </div>
                  </div>
                  <div className="bg-dark-700/50 rounded-lg p-2.5 flex items-center gap-2">
                    <Swords className="w-4 h-4 text-orange-400" />
                    <div>
                      <p className="text-gold-600 text-[10px] font-display uppercase">Dano</p>
                      <p className="text-orange-400 font-body font-semibold">{m.damage}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 scale-in" onClick={() => setModalOpen(false)}>
          <div
            className="bg-dark-card border border-gold-600/40 rounded-xl w-full max-w-md shadow-2xl shadow-gold-600/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold-600/30">
              <div className="flex items-center gap-2">
                <Skull className="w-5 h-5 text-gold-400" />
                <h3 className="font-display text-lg font-bold text-gold-400">
                  {editing ? 'Editar Monstro' : 'Criar Monstro'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gold-600 hover:text-gold-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-900/30 border border-red-600/40 rounded-lg text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Dragão Ancião"
                  className="w-full px-4 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 placeholder:text-gold-600/40 font-body focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Nível</label>
                  <input
                    type="number"
                    min="1"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-3 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 font-body focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Vida</label>
                  <input
                    type="number"
                    min="1"
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: e.target.value })}
                    className="w-full px-3 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 font-body focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Dano</label>
                  <input
                    type="number"
                    min="0"
                    value={form.damage}
                    onChange={(e) => setForm({ ...form, damage: e.target.value })}
                    className="w-full px-3 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 font-body focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-dark-700 border border-gold-600/30 text-gold-200/70 font-display text-sm rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 gold-gradient text-dark-900 font-display font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 scale-in" onClick={() => setDeleteTarget(null)}>
          <div
            className="bg-dark-card border border-red-600/40 rounded-xl w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 text-center">
              <div className="w-14 h-14 rounded-full bg-red-900/30 border border-red-600/40 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-gold-200 mb-2">Excluir Monstro</h3>
              <p className="text-gold-200/50 text-sm font-body">
                Deseja realmente excluir <span className="text-gold-400 font-semibold">{deleteTarget.name}</span>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 bg-dark-700 border border-gold-600/30 text-gold-200/70 font-display text-sm rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-700 text-white font-display font-semibold text-sm rounded-lg hover:bg-red-600 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
