import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Swords, Crown, BookOpen, Heart, Users, Bot, User, ExternalLink, Compass, Scroll } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const setRole = useAppStore((state) => state.setRole);

  const handleSelectRole = (role: 'player' | 'gm', targetPath?: string) => {
    setRole(role);
    navigate(targetPath || (role === 'player' ? '/player' : '/gm'));
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-wrapper">
        {/* 顶部 Hero 区域 */}
        <div className="onboarding-hero">
          <div className="onboarding-badge">
            MYTHIC BASTIONLAND
          </div>

          <h1 className="onboarding-title">
            神话堡垒之地
          </h1>
        </div>

        {/* 入口网格 */}
        <div className="onboarding-grid">
          {/* 骑士入口 */}
          <button
            onClick={() => handleSelectRole('player')}
            className="onboarding-card-btn"
          >
            <div className="onboarding-card-icon-box">
              <Swords className="w-8 h-8" />
            </div>
            <h2 className="onboarding-card-title">
              我是骑士 (Player)
            </h2>
          </button>

          {/* 裁判入口 */}
          <button
            onClick={() => handleSelectRole('gm')}
            className="onboarding-card-btn gm-card"
          >
            <div className="onboarding-card-icon-box" style={{ background: '#fef2f2', color: '#991b1b', borderColor: 'rgba(153,27,27,0.3)' }}>
              <Crown className="w-8 h-8" />
            </div>
            <h2 className="onboarding-card-title">
              我是裁判 (Game Master)
            </h2>
          </button>
        </div>

        {/* 独立六边形地图入口 */}
        <button
          onClick={() => navigate('/map')}
          className="w-full max-w-[720px] bg-gradient-to-r from-amber-950/20 via-stone-900/40 to-stone-900 border border-amber-500/40 hover:border-amber-500 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform border border-amber-500/30">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="font-serif font-bold text-amber-100 text-sm group-hover:text-amber-300 transition-colors flex items-center gap-2">
                <span>六边形探索地图门廊 (Hex Crawl Map)</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                  独立模块
                </span>
              </div>
              <div className="text-xs text-stone-400">
                裁判操作地图库 / 骑士加入迷雾房间 / 机制投骰塔
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform pr-2">
            选择进入 →
          </span>
        </button>

        {/* 全局规则与图鉴入口 */}
        <button
          onClick={() => handleSelectRole('player', '/player/library')}
          className="w-full max-w-[720px] bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 hover:border-amber-600 dark:hover:border-amber-500 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                72 骑士原型与规则图鉴库
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                查阅全部骑士原型、绝技、策略、伤疤与规则细则
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 dark:text-amber-400 group-hover:translate-x-1 transition-transform pr-2">
            进入图鉴库 →
          </span>
        </button>

        {/* 致谢名单卡片 (置于工具作者之前) */}
        <div className="onboarding-credits-box">
          <div className="onboarding-credits-header">
            <div className="onboarding-credits-title">
              <Scroll className="w-4 h-4 text-amber-700" />
              <span>致谢名单</span>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              以下名单按首字母排序，不分先后
            </span>
          </div>

          <div className="onboarding-credits-content">
            <div className="credits-row">
              <span className="credits-label">规则翻译：</span>
              <span className="credits-names">
                阿包，风魔乱闪，狗查，海灵，柯米，咸本，伊兰德，狱寺炎 <sup>†</sup>，A9，HXQXH，MayZone，Namer
              </span>
            </div>

            <div className="credits-row">
              <span className="credits-label">规则校对：</span>
              <span className="credits-names">柯米，拂晓鹧鸪啼，燕绿</span>
            </div>

            <div className="credits-row">
              <span className="credits-label">角色卡排版：</span>
              <span className="credits-names">钢打</span>
            </div>

            <div className="credits-row">
              <span className="credits-label">规则书排版：</span>
              <span className="credits-names">拂晓鹧鸪啼</span>
            </div>
          </div>

          <div className="onboarding-memorial-line">
            谨以此篇献给狱寺炎 YSY (1997-2025)，他的温柔与善良将始终激励我等。
          </div>
        </div>

        {/* 作者与社区信息卡片 */}
        <div className="onboarding-author-box">
          <div className="onboarding-author-header">
            <div className="onboarding-author-title">
              <Compass className="w-4 h-4 text-amber-700" />
              <span>工具作者与社区</span>
            </div>
            <a
              href="https://ifdian.net/a/nogubird"
              target="_blank"
              rel="noopener noreferrer"
              className="onboarding-sponsor-btn"
            >
              <Heart className="w-3.5 h-3.5 fill-current text-rose-200" />
              <span>为作者加油</span>
              <ExternalLink className="w-3 h-3 opacity-90" />
            </a>
          </div>

          <div className="onboarding-author-grid">
            <div className="onboarding-author-item">
              <div className="onboarding-author-item-icon">
                <User className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <span className="onboarding-author-item-label">工具作者</span>
                <span className="onboarding-author-item-val">不咕鸟（哈基米德）</span>
              </div>
            </div>

            <div className="onboarding-author-item">
              <div className="onboarding-author-item-icon">
                <Bot className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <span className="onboarding-author-item-label">辅助 AI</span>
                <span className="onboarding-author-item-val">Antigravity Gemini</span>
              </div>
            </div>

            <div className="onboarding-author-item">
              <div className="onboarding-author-item-icon">
                <Users className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <span className="onboarding-author-item-label">不咕鸟创作交流群</span>
                <span className="onboarding-author-item-val font-mono">261751459</span>
              </div>
            </div>

            <div className="onboarding-author-item">
              <div className="onboarding-author-item-icon" style={{ background: '#fef2f2', color: '#991b1b' }}>
                <Users className="w-4 h-4 text-red-800" />
              </div>
              <div>
                <span className="onboarding-author-item-label">成都秘密基地 TRPG 俱乐部群</span>
                <span className="onboarding-author-item-val font-mono" style={{ color: '#991b1b' }}>691707475</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
