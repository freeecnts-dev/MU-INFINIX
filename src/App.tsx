import { useState, useEffect, useCallback } from 'react';
import Sidebar, { type Page } from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import MonstersPage from '@/components/MonstersPage';
import PlayersPage from '@/components/PlayersPage';
import { supabase, type Monster, type Player } from '@/lib/supabase';

export default function App() {
  const [page, setPage] = useState<Page>('inicio');
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!supabase) {
      setLoadingStats(false);
      return;
    }

    try {
      const [monRes, playRes] = await Promise.all([
        supabase.from('monsters').select('*'),
        supabase.from('players').select('*'),
      ]);
      setMonsters(monRes.data ?? []);
      setPlayers(playRes.data ?? []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {page === 'inicio' && (
            <Dashboard monsters={monsters} players={players} loading={loadingStats} />
          )}
          {page === 'monstros' && <MonstersPage monsterCount={monsters.length} onCountChange={fetchStats} />}
          {page === 'jogadores' && <PlayersPage onCountChange={fetchStats} />}
        </div>
      </main>
    </div>
  );
}
