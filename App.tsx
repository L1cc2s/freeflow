import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Clock, Wallet, BarChart3, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { useAppStore } from './store';

// Import Pages
import { Dashboard } from './pages/Dashboard';
import { TimeTracker } from './pages/TimeTracker';
import { Finances } from './pages/Finances';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const NavItem = ({ to, icon: Icon, label, active, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 font-semibold' 
      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
    }`}
  >
    <Icon size={20} className={active ? 'text-primary-600 dark:text-primary-400' : 'group-hover:text-gray-700 dark:group-hover:text-gray-200'} />
    <span>{label}</span>
  </Link>
);

const AppContent = () => {
  const { state, updateSettings, startSession, stopSession, addManualSession, deleteSession, addTransaction, deleteTransaction } = useAppStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Clock className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              FreeFlow
            </span>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-500">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem to="/" icon={LayoutDashboard} label="Visão Geral" active={location.pathname === '/'} />
            <NavItem to="/tracker" icon={Clock} label="Timer & Horas" active={location.pathname === '/tracker'} />
            <NavItem to="/finances" icon={Wallet} label="Finanças" active={location.pathname === '/finances'} />
            <NavItem to="/reports" icon={BarChart3} label="Relatórios" active={location.pathname === '/reports'} />
          </nav>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
            <NavItem to="/settings" icon={SettingsIcon} label="Configurações" active={location.pathname === '/settings'} />
            {state.activeSessionId && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30 animate-pulse">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">Em Andamento</p>
                <p className="text-sm font-medium dark:text-green-200 truncate">
                  {state.sessions.find(s => s.id === state.activeSessionId)?.description || 'Trabalhando...'}
                </p>
                <Link to="/tracker" className="text-xs text-green-600 dark:text-green-400 underline mt-2 block">Ver Timer</Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-4 bg-white dark:bg-dark-800 border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 dark:text-gray-300">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-gray-800 dark:text-white">FreeFlow</span>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard state={state} />} />
              <Route path="/tracker" element={<TimeTracker state={state} startSession={startSession} stopSession={stopSession} addManualSession={addManualSession} deleteSession={deleteSession} />} />
              <Route path="/finances" element={<Finances state={state} addTransaction={addTransaction} deleteTransaction={deleteTransaction} />} />
              <Route path="/reports" element={<Reports state={state} />} />
              <Route path="/settings" element={<Settings settings={state.settings} updateSettings={updateSettings} />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;