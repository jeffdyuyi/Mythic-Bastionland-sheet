import { useState, useEffect } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AppLayout() {
  const userRole = useAppStore((state) => state.userRole);
  const clearRole = useAppStore((state) => state.clearRole);
  const location = useLocation();

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setInstallPrompt(null);
  };

  if (!userRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (userRole === 'player' && location.pathname.startsWith('/gm')) {
    return <Navigate to="/player" replace />;
  }
  if (userRole === 'gm' && location.pathname.startsWith('/player')) {
    return <Navigate to="/gm" replace />;
  }

  const playerNavLinks = [
    { to: '/player', label: '角色', icon: '⚔️' },
    { to: '/player/card', label: '角色卡', icon: '🃏' },
    { to: '/player/map', label: '地图', icon: '🗺️' },
    { to: '/player/rules', label: '规则', icon: '⚖️' },
  ];

  const gmNavLinks = [
    { to: '/gm', label: '控制台', icon: '👑' },
    { to: '/gm/map', label: '地图', icon: '🗺️' },
    { to: '/gm/myths', label: '神话战报', icon: '📜' },
    { to: '/gm/sparks', label: '灵感火花', icon: '⚡' },
  ];

  const navLinks = userRole === 'gm' ? gmNavLinks : playerNavLinks;

  return (
    <div className="app-shell">
      {/* 顶部 Header */}
      <header className="app-header">
        <NavLink to="/" className="header-brand" title="返回首页大厅">
          <span className="brand-accent">神话</span>堡垒之地
        </NavLink>

        {/* 桌面端导航 */}
        <nav className="header-nav desktop-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/player' || link.to === '/gm'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{link.icon}</span> {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          {installPrompt && (
            <button className="btn btn-xs btn-primary pwa-install-btn" onClick={handleInstallPWA}>
              📱 安装 App
            </button>
          )}

          <span className={`role-badge ${userRole === 'gm' ? 'gm' : 'player'}`}>
            {userRole === 'gm' ? 'GM' : '玩家'}
          </span>
          <button onClick={clearRole} className="btn-exit">
            退出
          </button>
        </div>
      </header>

      {/* PWA 顶部安装横幅 (移动端/桌面可弹出提示) */}
      {showInstallBanner && installPrompt && (
        <div className="pwa-install-banner no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📱</span>
            <span>安装神话堡垒 App 到桌面或手机主屏幕，享受全功能离线体验！</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="btn btn-xs btn-primary" onClick={handleInstallPWA}>
              立即安装
            </button>
            <button className="btn btn-xs btn-ghost" onClick={() => setShowInstallBanner(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 页面主主体 */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* 移动端底部固定导航栏 */}
      <nav className="mobile-bottom-nav">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/player' || link.to === '/gm'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{link.icon}</span>
            <span className="mobile-nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
