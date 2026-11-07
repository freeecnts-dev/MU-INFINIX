import { useState, useEffect } from 'react';
import { supabase, type Player } from '@/lib/supabase';
import { Plus, Pencil, Trash2, X, Users, Search, Swords, Heart, AlertTriangle, Shield, Coins, Wifi, WifiOff, UserCircle } from 'lucide-react';

type PlayersPageProps = {
  onCountChange: () => void;
};

const playerClasses = [
  'Dark Knight',
  'Dark Wizard',
  'Fairy Elf',
  'Magic Gladiator',
  'Dark Lord',
  'Summoner',
  'Rage Fighter',
];

const defaultForm = {
  name: '',
  login: '',
  level: '1',
  class: 'Dark Knight',
  hp: '100',
  zen: '0',
  is_online: 'offline',
};

export default function PlayersPage({ onCountChange }: PlayersPageProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);

  const fetchPlayers = async () => {
    setLoading(true);
    if (!supabase) { setError('Banco de dados não configurado.'); setLoading(false); return; }
    const { data, error } = await supabase.from('players').select('*').order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setPlayers(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (p: Player) => {
    setEditing(p);
    setForm({
      name: p.name,
      login: p.login,
      level: String(p.level),
      class: p.class,
      hp: String(p.hp),
      zen: String(p.zen),
      is_online: p.is_online ? 'online' : 'offline',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const login = form.login.trim();
    const level = parseInt(form.level, 10);
    const hp = parseInt(form.hp, 10);
    const zen = parseInt(form.zen, 10);
    const playerClass = form.class;
    const isOnline = form.is_online === 'online';

    if (!name) { setError('Informe o nome do jogador.'); return; }
    if (!login) { setError('Informe o login do jogador.'); return; }
    if (isNaN(level) || level < 1) { setError('Nível deve ser um número maior que zero.'); return; }
    if (isNaN(hp) || hp < 1) { setError('Vida deve ser um número maior que zero.'); return; }
    if (isNaN(zen) || zen < 0) { setError('Zen deve ser um número válido (zero ou maior).'); return; }

    if (!supabase) { setError('Banco de dados não configurado.'); return; }
    setSaving(true);
    setError('');

    if (editing) {
      const { error: err } = await supabase
        .from('players')
        .update({ name, login, level, class: playerClass, hp, zen, is_online: isOnline })
        .eq('id', editing.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase
        .from('players')
        .insert({ name, login, level, class: playerClass, hp, zen, is_online: isOnline });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setModalOpen(false);
    onCountChange();
    fetchPlayers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!supabase) { setError('Banco de dados não configurado.'); return; }
    const { error: err } = await supabase.from('players').delete().eq('id', deleteTarget.id);
    if (err) { setError(err.message); return; }
    setDeleteTarget(null);
    onCountChange();
    fetchPlayers();
  };

  const toggleOnline = async (p: Player) => {
    if (!supabase) { setError('Banco de dados não configurado.'); return; }
    const { error: err } = await supabase
      .from('players')
      .update({ is_online: !p.is_online })
      .eq('id', p.id);
    if (err) return;
    onCountChange();
    fetchPlayers();
  };

  let filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.login.toLowerCase().includes(search.toLowerCase()) ||
    p.class.toLowerCase().includes(search.toLowerCase())
  );
  if (statusFilter !== 'all') {
    filtered = filtered.filter((p) => (statusFilter === 'online' ? p.is_online : !p.is_online));
  }

  const onlineCount = players.filter((p) => p.is_online).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-gold-400" />
            <span className="text-gold-600 text-[11px] font-display tracking-[0.2em] uppercase">Aventureiros</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold gold-text-gradient">Gerenciar Jogadores</h2>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 gold-gradient text-dark-900 font-display font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-gold-600/20"
        >
          <Plus className="w-4 h-4" />
          Novo Jogador
        </button>
      </div>

      {/* Online counter */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-dark-card border border-gold-600/30 rounded-lg w-fit">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-400 text-sm font-display tracking-wide">
          {onlineCount} {onlineCount === 1 ? 'jogador online' : 'jogadores online'}
        </span>
      </div>

      {/* Search + Status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, login ou classe..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-gold-600/30 rounded-lg text-gold-200 placeholder:text-gold-600/40 font-body text-sm focus:outline-none focus:border-gold-400 transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-dark-card border border-gold-600/30 rounded-lg p-1">
          {(['all', 'online', 'offline'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md font-display text-xs tracking-wide transition-all ${
                statusFilter === s
                  ? 'gold-gradient text-dark-900 font-semibold'
                  : 'text-gold-200/50 hover:text-gold-400'
              }`}
            >
              {s === 'all' ? 'Todos' : s === 'online' ? 'Online' : 'Offline'}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-gold-200/40 font-display">Carregando jogadores...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-dark-card border border-gold-600/20 rounded-xl">
          <Users className="w-10 h-10 text-gold-600/40 mx-auto mb-3" />
          <p className="text-gold-200/40 font-display">
            {search || statusFilter !== 'all' ? 'Nenhum jogador encontrado.' : 'Nenhum jogador cadastrado ainda.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block bg-dark-card border border-gold-600/30 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold-600/30">
                  <th className="text-left px-5 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Jogador</th>
                  <th className="text-left px-5 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Classe</th>
                  <th className="text-left px-5 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Nível</th>
                  <th className="text-left px-5 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Vida</th>
                  <th className="text-left px-5 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Zen</th>
                  <th className="text-left px-5 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Status</th>
                  <th className="text-right px-5 py-3 text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gold-600/10 hover:bg-dark-700/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-dark-700 border border-gold-600/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-gold-600" />
                        </div>
                        <div>
                          <p className="font-display text-gold-200 font-medium leading-tight">{p.name}</p>
                          <p className="text-gold-600/60 text-xs font-body flex items-center gap-1">
                            <UserCircle className="w-3 h-3" />
                            {p.login}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-dark-700 border border-gold-600/20 rounded text-gold-300 text-xs font-display">
                        {p.class}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gold-200/70 font-body">{p.level}</td>
                    <td className="px-5 py-4">
                      <span className="text-red-400 font-body">{p.hp}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-yellow-400 font-body flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        {p.zen.toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleOnline(p)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display tracking-wide transition-all hover:scale-105 ${
                          p.is_online
                            ? 'bg-green-900/30 border border-green-600/40 text-green-400'
                            : 'bg-dark-700 border border-gold-600/20 text-gold-200/40'
                        }`}
                        title="Clique para alternar status"
                      >
                        {p.is_online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {p.is_online ? 'Online' : 'Offline'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-2 rounded-md text-gold-600 hover:text-gold-400 hover:bg-dark-700 transition-colors"
                          aria-label="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
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
          <div className="lg:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="bg-dark-card border border-gold-600/30 rounded-xl p-4 fade-in">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-dark-700 border border-gold-600/20 flex items-center justify-center flex-shrink-0 relative">
                      <Shield className="w-4 h-4 text-gold-600" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-card ${p.is_online ? 'bg-green-500' : 'bg-gray-600'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-gold-200 font-medium truncate">{p.name}</p>
                      <p className="text-gold-600/60 text-xs font-body flex items-center gap-1">
                        <UserCircle className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{p.login}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-2 rounded-md text-gold-600 hover:text-gold-400 hover:bg-dark-700 transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-2 rounded-md text-red-600 hover:text-red-400 hover:bg-dark-700 transition-colors"
                      aria-label="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-dark-700 border border-gold-600/20 rounded text-gold-300 text-[10px] font-display">
                    {p.class}
                  </span>
                  <button
                    onClick={() => toggleOnline(p)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display transition-all ${
                      p.is_online
                        ? 'bg-green-900/30 border border-green-600/40 text-green-400'
                        : 'bg-dark-700 border border-gold-600/20 text-gold-200/40'
                    }`}
                  >
                    {p.is_online ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                    {p.is_online ? 'Online' : 'Offline'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-dark-700/50 rounded-lg p-2 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gold-600 text-[9px] font-display uppercase">Nível</p>
                      <p className="text-gold-200 font-body font-semibold text-sm">{p.level}</p>
                    </div>
                  </div>
                  <div className="bg-dark-700/50 rounded-lg p-2 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gold-600 text-[9px] font-display uppercase">Vida</p>
                      <p className="text-red-400 font-body font-semibold text-sm">{p.hp}</p>
                    </div>
                  </div>
                  <div className="bg-dark-700/50 rounded-lg p-2 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gold-600 text-[9px] font-display uppercase">Zen</p>
                      <p className="text-yellow-400 font-body font-semibold text-sm truncate">{p.zen.toLocaleString('pt-BR')}</p>
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
            className="bg-dark-card border border-gold-600/40 rounded-xl w-full max-w-md shadow-2xl shadow-gold-600/10 max-h-[90vh] overflow-y-auto scrollbar-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold-600/30 sticky top-0 bg-dark-card z-10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-400" />
                <h3 className="font-display text-lg font-bold text-gold-400">
                  {editing ? 'Editar Jogador' : 'Criar Jogador'}
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
                  placeholder="Ex: Arthur Pendragon"
                  className="w-full px-4 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 placeholder:text-gold-600/40 font-body focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Login</label>
                <input
                  type="text"
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  placeholder="Ex: arthur_pendragon"
                  className="w-full px-4 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 placeholder:text-gold-600/40 font-body focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Classe</label>
                <select
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 font-body focus:outline-none focus:border-gold-400 transition-colors"
                >
                  {playerClasses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Nível</label>
                  <input
                    type="number"
                    min="1"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 font-body focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Vida</label>
                  <input
                    type="number"
                    min="1"
                    value={form.hp}
                    onChange={(e) => setForm({ ...form, hp: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 font-body focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Zen (moeda do jogo)</label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                  <input
                    type="number"
                    min="0"
                    value={form.zen}
                    onChange={(e) => setForm({ ...form, zen: e.target.value })}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-gold-600/30 rounded-lg text-gold-200 placeholder:text-gold-600/40 font-body focus:outline-none focus:border-gold-400 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-1.5">Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_online: 'online' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-display text-sm transition-all ${
                      form.is_online === 'online'
                        ? 'bg-green-900/40 border border-green-600/50 text-green-400'
                        : 'bg-dark-700 border border-gold-600/20 text-gold-200/40 hover:border-gold-600/40'
                    }`}
                  >
                    <Wifi className="w-4 h-4" />
                    Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, is_online: 'offline' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-display text-sm transition-all ${
                      form.is_online === 'offline'
                        ? 'bg-dark-600 border border-gold-600/50 text-gold-200'
                        : 'bg-dark-700 border border-gold-600/20 text-gold-200/40 hover:border-gold-600/40'
                    }`}
                  >
                    <WifiOff className="w-4 h-4" />
                    Offline
                  </button>
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
              <h3 className="font-display text-lg font-bold text-gold-200 mb-2">Excluir Jogador</h3>
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
