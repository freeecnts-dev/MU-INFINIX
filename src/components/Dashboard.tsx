import { Shield, Skull, Users, Activity, Swords, Heart, Zap, TrendingUp, Coins, Wifi } from 'lucide-react';
import type { Monster, Player } from '@/lib/supabase';

type DashboardProps = {
  monsters: Monster[];
  players: Player[];
  loading: boolean;
};

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  accent,
}: {
  icon: typeof Shield;
  label: string;
  value: string | number;
  subtitle: string;
  accent: string;
}) {
  return (
    <div className="relative bg-dark-card border border-gold-600/30 rounded-xl p-5 overflow-hidden group hover:border-gold-400/50 transition-all duration-300 fade-in">
      <div className="absolute top-0 left-0 right-0 h-px shimmer-gold" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase mb-2">{label}</p>
          <p className="font-display text-3xl font-bold gold-text-gradient">{value}</p>
          <p className="text-gold-200/40 text-sm mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="w-6 h-6 text-gold-400" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ monsters, players, loading }: DashboardProps) {
  const totalMonsters = monsters.length;
  const totalPlayers = players.length;
  const onlinePlayers = players.filter((p) => p.is_online).length;
  const avgMonsterLevel = totalMonsters > 0 ? Math.round(monsters.reduce((a, m) => a + m.level, 0) / totalMonsters) : 0;
  const avgPlayerLevel = totalPlayers > 0 ? Math.round(players.reduce((a, p) => a + p.level, 0) / totalPlayers) : 0;
  const totalHp = monsters.reduce((a, m) => a + m.hp, 0) + players.reduce((a, p) => a + p.hp, 0);
  const totalDamage = monsters.reduce((a, m) => a + m.damage, 0);
  const totalZen = players.reduce((a, p) => a + p.zen, 0);

  const strongestMonster = monsters.length > 0
    ? monsters.reduce((max, m) => (m.damage > max.damage ? m : max), monsters[0])
    : null;

  const topPlayer = players.length > 0
    ? players.reduce((max, p) => (p.level > max.level ? p : max), players[0])
    : null;

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="relative bg-dark-card border border-gold-600/30 rounded-xl overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #d4af37 1px, transparent 1px), radial-gradient(circle at 80% 50%, #d4af37 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }} />
        <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />
        <div className="relative px-6 py-10 md:px-10 md:py-12">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-gold-400" />
            <span className="text-gold-600 text-[11px] font-display tracking-[0.2em] uppercase">Painel do Reino</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold gold-text-gradient mb-3">
            Bem-vindo ao MU INFINIX
          </h2>
          <p className="text-gold-200/50 text-base md:text-lg max-w-2xl leading-relaxed">
            Gerencie os habitantes e aventureiros do seu reino medieval. Monstre os monstros,
            comande os jogadores e mantenha a ordem em suas terras.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700/60 rounded-full border border-gold-600/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 text-xs font-display tracking-wide">Servidor Online</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700/60 rounded-full border border-gold-600/20">
              <Wifi className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-display tracking-wide">
                {loading ? '...' : onlinePlayers} {onlinePlayers === 1 ? 'jogador online' : 'jogadores online'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-700/60 rounded-full border border-gold-600/20">
              <Activity className="w-3 h-3 text-gold-400" />
              <span className="text-gold-200/60 text-xs font-display tracking-wide">Uptime: 99.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Skull}
          label="Monstros"
          value={loading ? '...' : totalMonsters}
          subtitle="Criaturas cadastradas"
          accent="bg-dark-700 border border-gold-600/20"
        />
        <StatCard
          icon={Users}
          label="Jogadores"
          value={loading ? '...' : totalPlayers}
          subtitle={`${onlinePlayers} online agora`}
          accent="bg-dark-700 border border-gold-600/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Nível Médio (Monstros)"
          value={loading ? '...' : avgMonsterLevel}
          subtitle="Força média do exercito"
          accent="bg-dark-700 border border-gold-600/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Nível Médio (Jogadores)"
          value={loading ? '...' : avgPlayerLevel}
          subtitle="Progresso dos aventureiros"
          accent="bg-dark-700 border border-gold-600/20"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-card border border-gold-600/30 rounded-xl p-5 flex items-center gap-4 fade-in">
          <div className="w-12 h-12 rounded-lg bg-dark-700 border border-gold-600/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Vida Total</p>
            <p className="font-display text-2xl font-bold text-gold-200">{loading ? '...' : totalHp.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="bg-dark-card border border-gold-600/30 rounded-xl p-5 flex items-center gap-4 fade-in">
          <div className="w-12 h-12 rounded-lg bg-dark-700 border border-gold-600/20 flex items-center justify-center">
            <Swords className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Dano Total (Monstros)</p>
            <p className="font-display text-2xl font-bold text-gold-200">{loading ? '...' : totalDamage.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="bg-dark-card border border-gold-600/30 rounded-xl p-5 flex items-center gap-4 fade-in">
          <div className="w-12 h-12 rounded-lg bg-dark-700 border border-gold-600/20 flex items-center justify-center">
            <Coins className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Zen em Circulação</p>
            <p className="font-display text-2xl font-bold text-yellow-400">{loading ? '...' : totalZen.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="bg-dark-card border border-gold-600/30 rounded-xl p-5 flex items-center gap-4 fade-in">
          <div className="w-12 h-12 rounded-lg bg-dark-700 border border-gold-600/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-gold-600 text-[11px] font-display tracking-[0.15em] uppercase">Jogadores Online</p>
            <p className="font-display text-2xl font-bold text-green-400">
              {loading ? '...' : `${onlinePlayers}/${totalPlayers}`}
            </p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Strongest monster */}
        <div className="bg-dark-card border border-gold-600/30 rounded-xl p-6 fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Skull className="w-4 h-4 text-gold-400" />
            <h3 className="font-display text-gold-400 text-sm tracking-[0.15em] uppercase">Monstro Mais Forte</h3>
          </div>
          {loading ? (
            <p className="text-gold-200/30">Carregando...</p>
          ) : strongestMonster ? (
            <div className="space-y-3">
              <p className="font-display text-2xl font-bold gold-text-gradient">{strongestMonster.name}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-dark-700/60 rounded-lg p-3 border border-gold-600/10">
                  <p className="text-gold-600 text-[10px] font-display uppercase tracking-wide">Nível</p>
                  <p className="text-gold-200 font-display text-xl font-bold">{strongestMonster.level}</p>
                </div>
                <div className="bg-dark-700/60 rounded-lg p-3 border border-gold-600/10">
                  <p className="text-gold-600 text-[10px] font-display uppercase tracking-wide">Vida</p>
                  <p className="text-red-400 font-display text-xl font-bold">{strongestMonster.hp}</p>
                </div>
                <div className="bg-dark-700/60 rounded-lg p-3 border border-gold-600/10">
                  <p className="text-gold-600 text-[10px] font-display uppercase tracking-wide">Dano</p>
                  <p className="text-orange-400 font-display text-xl font-bold">{strongestMonster.damage}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gold-200/30">Nenhum monstro cadastrado.</p>
          )}
        </div>

        {/* Top player */}
        <div className="bg-dark-card border border-gold-600/30 rounded-xl p-6 fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-gold-400" />
            <h3 className="font-display text-gold-400 text-sm tracking-[0.15em] uppercase">Aventureiro de Maior Nível</h3>
          </div>
          {loading ? (
            <p className="text-gold-200/30">Carregando...</p>
          ) : topPlayer ? (
            <div className="space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="font-display text-2xl font-bold gold-text-gradient">{topPlayer.name}</p>
                <span className="text-gold-600 text-sm font-display">{topPlayer.class}</span>
                {topPlayer.is_online && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-900/30 border border-green-600/40 rounded-full text-green-400 text-[10px] font-display">
                    <Wifi className="w-2.5 h-2.5" /> Online
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-700/60 rounded-lg p-3 border border-gold-600/10">
                  <p className="text-gold-600 text-[10px] font-display uppercase tracking-wide">Nível</p>
                  <p className="text-gold-200 font-display text-xl font-bold">{topPlayer.level}</p>
                </div>
                <div className="bg-dark-700/60 rounded-lg p-3 border border-gold-600/10">
                  <p className="text-gold-600 text-[10px] font-display uppercase tracking-wide">Zen</p>
                  <p className="text-yellow-400 font-display text-xl font-bold">{topPlayer.zen.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gold-200/30">Nenhum jogador cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
