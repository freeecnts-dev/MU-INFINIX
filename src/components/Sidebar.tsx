import { useState } from 'react';
import { Menu, X, Home, Skull, Users, Shield, Scroll } from 'lucide-react';

export type Page = 'inicio' | 'monstros' | 'jogadores';

type SidebarProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

const navItems: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'inicio', label: 'Início', icon: Home },
  { id: 'monstros', label: 'Gerenciar Monstros', icon: Skull },
  { id: 'jogadores', label: 'Gerenciar Jogadores', icon: Users },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-dark-900 border-b border-gold-600/40 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-gold-400" />
          <span className="font-display font-bold text-gold-400 text-lg tracking-wider">MU INFINIX</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gold-400 p-1.5 rounded hover:bg-dark-700 transition-colors"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-dark-900 border-r border-gold-600/30 flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo / Title */}
        <div className="px-6 py-6 border-b border-gold-600/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-lg gold-gradient flex items-center justify-center glow-gold">
                <Shield className="w-6 h-6 text-dark-900" />
              </div>
            </div>
            <div>
              <h1 className="font-display font-bold text-gold-400 text-xl tracking-wider leading-tight">
                MU INFINIX
              </h1>
              <p className="text-gold-600 text-[10px] font-display tracking-[0.2em] uppercase">
                Painel Admin
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-dark">
          <p className="px-2 mb-3 text-gold-600 text-[10px] font-display tracking-[0.2em] uppercase flex items-center gap-1.5">
            <Scroll className="w-3 h-3" />
            Navegação
          </p>
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-display text-sm tracking-wide transition-all duration-200 group ${
                      active
                        ? 'gold-gradient text-dark-900 font-semibold shadow-lg shadow-gold-600/20'
                        : 'text-gold-200/60 hover:text-gold-400 hover:bg-dark-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-dark-900' : 'text-gold-600 group-hover:text-gold-400'}`} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer decoration */}
        <div className="px-6 py-4 border-t border-gold-600/20">
          <div className="flex items-center justify-center gap-2 text-gold-600/40">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-600/30" />
            <Shield className="w-3 h-3" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-600/30" />
          </div>
          <p className="text-center text-gold-600/40 text-[10px] font-display tracking-widest mt-2">
            v1.0 · Medieval
          </p>
        </div>
      </aside>
    </>
  );
}
