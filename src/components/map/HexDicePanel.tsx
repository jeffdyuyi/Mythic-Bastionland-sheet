import React, { useState } from 'react';
import { useMapStore } from '../../stores/useMapStore';
import { Dices, Shield, Compass, Swords, Scroll, Trash2, CheckCircle2 } from 'lucide-react';

export const HexDicePanel: React.FC = () => {
  const { diceLogs, rollDice, clearDiceLogs } = useMapStore();
  const [customExpr, setCustomExpr] = useState('2d12');
  const [rollerName, setRollerName] = useState('骑士');
  const [lastRollAnim, setLastRollAnim] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRoll = (expression: string, label: string) => {
    const res = rollDice(expression, label, rollerName);
    setLastRollAnim(res.id);
    setTimeout(() => setLastRollAnim(null), 600);
  };

  const handleCustomRoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExpr.trim()) return;
    handleRoll(customExpr.trim(), '自定义掷骰');
  };

  const copyResult = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-amber-700 dark:text-amber-500" />
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            六边形探索骰子塔
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500">掷骰人:</span>
          <input
            type="text"
            value={rollerName}
            onChange={(e) => setRollerName(e.target.value)}
            className="w-20 px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="名字"
          />
        </div>
      </div>

      {/* 1. 《神话堡垒之地》机制专属判定快捷按钮 */}
      <div>
        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          神话堡垒机制判定
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleRoll('1d20', '美德判定 (Virtue Check)')}
            className="flex items-center justify-between p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-900/60 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <div>
                <div className="text-xs font-bold text-amber-950 dark:text-amber-200">美德判定</div>
                <div className="text-[10px] text-amber-700/70 dark:text-amber-400/70">1d20 ≤ 美德值</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300">d20</span>
          </button>

          <button
            onClick={() => handleRoll('1d6', '六边形遭遇判定 (Hex Crawl)')}
            className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">六边形遭遇</div>
                <div className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70">1d6 (1:遭遇 2-3:预兆)</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">d6</span>
          </button>

          <button
            onClick={() => handleRoll('d6+d12', '开局诗号/灵感表 (Title & Spark)')}
            className="flex items-center justify-between p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Scroll className="w-4 h-4 text-rose-700 dark:text-rose-400" />
              <div>
                <div className="text-xs font-bold text-rose-950 dark:text-rose-200">诗号/随机表</div>
                <div className="text-[10px] text-rose-700/70 dark:text-rose-400/70">d6 + d12</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-rose-800 dark:text-rose-300">d6+d12</span>
          </button>

          <button
            onClick={() => handleRoll('1d8', '武器/防护伤害 (Damage/GD)')}
            className="flex items-center justify-between p-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl hover:bg-stone-200 dark:hover:bg-stone-750 transition text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Swords className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <div>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100">伤害/防护</div>
                <div className="text-[10px] text-stone-500">1d8 伤害</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-400">d8</span>
          </button>
        </div>
      </div>

      {/* 2. 基础多面骰与自定义表达式 */}
      <div>
        <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          快捷多面骰
        </div>
        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {['d4', 'd6', 'd8', 'd10', 'd12', 'd20', '2d12', '3d6'].map((dice) => (
            <button
              key={dice}
              onClick={() => handleRoll(dice, `${dice} 掷骰`)}
              className="py-1.5 bg-stone-100 dark:bg-stone-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono font-bold text-stone-800 dark:text-stone-200 transition cursor-pointer"
            >
              {dice}
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomRoll} className="flex gap-2">
          <input
            type="text"
            value={customExpr}
            onChange={(e) => setCustomExpr(e.target.value)}
            placeholder="例如: 2d6+3"
            className="flex-1 px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800 dark:text-stone-200"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            掷骰
          </button>
        </form>
      </div>

      {/* 3. 投骰历史记录 */}
      <div>
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-2 mb-3">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            掷骰历史记录 ({diceLogs.length})
          </div>
          {diceLogs.length > 0 && (
            <button
              onClick={clearDiceLogs}
              className="text-[11px] text-stone-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> 清空
            </button>
          )}
        </div>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {diceLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-400 italic">
              暂无投骰记录，点击上方按钮掷骰！
            </div>
          ) : (
            diceLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-2xl border transition-all ${
                  lastRollAnim === log.id
                    ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 scale-[1.02]'
                    : 'bg-stone-50/70 dark:bg-stone-800/50 border-stone-200/80 dark:border-stone-800'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {log.label}
                    </span>
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-full font-mono">
                      {log.roller}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">{log.timestamp}</span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    {log.detail || log.expression}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg font-serif font-black ${
                        log.isCritical
                          ? 'text-rose-600 animate-bounce'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {log.total}
                    </span>
                    <button
                      onClick={() =>
                        copyResult(
                          `[${log.roller}] ${log.label}: ${log.total} (${log.detail})`,
                          log.id
                        )
                      }
                      title="复制结果"
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      {copiedId === log.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <span className="text-[10px]">复制</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
