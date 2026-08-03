import { useState } from 'react';
import { MYTH_DB, getMythById } from '../../data/myths';
import { useGMStore } from '../../stores/useGMStore';
import type { MythArchetype, MythSpecificTable } from '../../types';
import {
  BookOpen,
  Sparkles,
  Plus,
  CheckSquare,
  Square,
  MapPin,
  Edit3,
  Trash2,
  Dices,
  Eye,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Search,
  BookMarked
} from 'lucide-react';

export default function MythChronicles() {
  const { activeMyths, activeMythIds, activateMyth, removeActiveMyth, toggleOmen, updateMythNotes } = useGMStore();

  const [activeTab, setActiveTab] = useState<'campaign' | 'codex'>('campaign');
  const [selectedMythId, setSelectedMythId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [previewMythId, setPreviewMythId] = useState<string | null>(null);

  function handleActivateSelected() {
    if (!selectedMythId) return;
    activateMyth(selectedMythId);
    setSelectedMythId('');
    setActiveTab('campaign');
  }

  function handleRandomActivate() {
    const randomIndex = Math.floor(Math.random() * MYTH_DB.length);
    const randomMyth = MYTH_DB[randomIndex];
    if (randomMyth) {
      activateMyth(randomMyth.id);
      setActiveTab('campaign');
    }
  }

  // 过滤神话图鉴
  const filteredMyths = MYTH_DB.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.number.includes(searchQuery) ||
      m.quote.toLowerCase().includes(searchQuery.toLowerCase());
    const prefix = m.number.split('-')[0];
    const matchesGroup = selectedGroup === 'all' || prefix === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="space-y-6">
      {/* 顶部控制栏与页签切换 */}
      <div className="detail-section-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-red-900 dark:text-red-300 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-700" />
              <span>裁判端：神话与预兆编年史 (Myth Chronicles)</span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              追踪战役神话预兆演进、查阅官方72神话全景图鉴与专属随机表。
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              className={`btn btn-sm flex-1 sm:flex-initial flex items-center justify-center gap-1.5 ${
                activeTab === 'campaign' ? 'btn-primary' : 'btn-ghost text-stone-700 dark:text-stone-300'
              }`}
              onClick={() => setActiveTab('campaign')}
            >
              <Zap className="w-4 h-4" />
              <span>战役激活 ({activeMythIds.length})</span>
            </button>
            <button
              className={`btn btn-sm flex-1 sm:flex-initial flex items-center justify-center gap-1.5 ${
                activeTab === 'codex' ? 'btn-primary' : 'btn-ghost text-stone-700 dark:text-stone-300'
              }`}
              onClick={() => setActiveTab('codex')}
            >
              <BookMarked className="w-4 h-4" />
              <span>神话图鉴 (72)</span>
            </button>
          </div>
        </div>

        {/* 快捷激活组件 */}
        <div className="flex flex-col md:flex-row items-center gap-3 pt-1">
          <div className="form-group flex-1 w-full">
            <select
              className="form-select w-full font-serif"
              value={selectedMythId}
              onChange={e => setSelectedMythId(e.target.value)}
            >
              <option value="">— 选择要激活的神话 (NO. 1-1 至 5-12) —</option>
              {MYTH_DB.map(m => (
                <option key={m.id} value={m.id}>
                  NO. {m.number}: {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              className="btn btn-primary btn-sm shrink-0 flex items-center justify-center gap-1.5 flex-1 md:flex-initial shadow-sm"
              onClick={handleActivateSelected}
              disabled={!selectedMythId}
            >
              <Plus className="w-4 h-4" />
              <span>加入战役追踪</span>
            </button>

            <button
              className="btn btn-secondary btn-sm shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
              onClick={handleRandomActivate}
              title="随机掷骰抽取一个神话加入战役"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>🎲 随机抽选</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主视图 1: 战役激活神话列表 */}
      {activeTab === 'campaign' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-700" />
              <span>当前在演神话 ({activeMythIds.length})</span>
            </h3>
          </div>

          {activeMythIds.length === 0 ? (
            <div className="p-12 text-center bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 space-y-3">
              <div className="text-5xl">🔮</div>
              <h3 className="font-bold text-stone-800 dark:text-stone-200 text-lg font-serif">战役中暂无激活的神话</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                你可以从上方下拉菜单中选择一个神话，或点击“🎲 随机抽选”将神话引入战役，开启预兆 1-6 阶段追踪与裁判专属随机表。
              </p>
              <button
                className="btn btn-primary btn-sm mx-auto flex items-center gap-2 mt-2"
                onClick={handleRandomActivate}
              >
                <Sparkles className="w-4 h-4" />
                <span>立即随机生成一个神话</span>
              </button>
            </div>
          ) : (
            activeMythIds.map(instanceId => {
              const activeInstance = activeMyths[instanceId];
              if (!activeInstance) return null;
              const mythDef = getMythById(activeInstance.mythId);
              if (!mythDef) return null;

              return (
                <ActiveMythCard
                  key={instanceId}
                  activeInstance={activeInstance}
                  mythDef={mythDef}
                  onToggleOmen={index => toggleOmen(instanceId, index)}
                  onUpdateNotes={notes => updateMythNotes(instanceId, notes)}
                  onRemove={() => removeActiveMyth(instanceId)}
                />
              );
            })
          )}
        </div>
      )}

      {/* 主视图 2: 72神话全景图鉴与专属表 */}
      {activeTab === 'codex' && (
        <div className="space-y-5">
          {/* 图鉴筛选器 */}
          <div className="bg-stone-100 dark:bg-stone-900/60 p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="搜索神话名称、编号或引言关键词..."
                className="form-input w-full pl-9 text-xs sm:text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                className="form-select text-xs sm:text-sm w-full sm:w-auto font-serif"
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
              >
                <option value="all">全部神话分组 (Group 1 - 6)</option>
                <option value="1">第 1 组 (d6=1: 1-1 至 1-12)</option>
                <option value="2">第 2 组 (d6=2: 2-1 至 2-12)</option>
                <option value="3">第 3 组 (d6=3: 3-1 至 3-12)</option>
                <option value="4">第 4 组 (d6=4: 4-1 至 4-12)</option>
                <option value="5">第 5 组 (d6=5: 5-1 至 5-12)</option>
                <option value="6">第 6 组 (d6=6: 6-1 至 6-12)</option>
              </select>
            </div>
          </div>

          {/* 列表 */}
          <div className="grid grid-cols-1 gap-4">
            {filteredMyths.map(myth => (
              <CodexMythCard
                key={myth.id}
                myth={myth}
                isExpanded={previewMythId === myth.id}
                onToggleExpand={() => setPreviewMythId(previewMythId === myth.id ? null : myth.id)}
                onActivate={() => {
                  activateMyth(myth.id);
                  setActiveTab('campaign');
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 激活神话卡片组件 (Active Myth Card)
 */
function ActiveMythCard({
  activeInstance,
  mythDef,
  onToggleOmen,
  onUpdateNotes,
  onRemove,
}: {
  activeInstance: { currentOmenIndex: number; checkedOmens: boolean[]; notes: string; createdAt: string };
  mythDef: MythArchetype;
  onToggleOmen: (index: number) => void;
  onUpdateNotes: (notes: string) => void;
  onRemove: () => void;
}) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const completedOmensCount = activeInstance.checkedOmens.filter(Boolean).length;
  const progressPercent = Math.round((completedOmensCount / 6) * 100);

  return (
    <div className="bg-white dark:bg-stone-900 border-2 border-red-900/30 dark:border-red-900/50 rounded-2xl shadow-lg overflow-hidden transition-all">
      {/* 卡片头部 */}
      <div className="bg-gradient-to-r from-red-950 via-stone-900 to-amber-950 text-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-red-800/40">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-amber-500 text-stone-950 font-mono font-bold text-xs rounded-lg shadow-sm">
            NO. {mythDef.number}
          </span>
          <div>
            <h3 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2">
              <span>{mythDef.name}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="text-xs font-semibold text-amber-300 bg-black/40 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>预兆进度: {completedOmensCount}/6 ({progressPercent}%)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className="btn btn-xs btn-ghost text-stone-300 hover:text-white p-1"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? '展开详情' : '折叠详情'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <button
              className="btn btn-xs btn-danger flex items-center gap-1 cursor-pointer px-2.5 py-1"
              onClick={onRemove}
              title="从当前战役中归档并收回此神话"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>结束神话</span>
            </button>
          </div>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5 md:p-6 space-y-6">
          {/* 引言 Quote */}
          <div className="relative bg-amber-500/5 dark:bg-amber-950/20 border-l-4 border-amber-600 dark:border-amber-500 p-4 rounded-r-xl">
            <p className="font-serif italic text-stone-800 dark:text-stone-200 text-sm md:text-base leading-relaxed">
              “{mythDef.quote}”
            </p>
          </div>

          {/* 预兆追踪 1-6 (Omens) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm md:text-base text-red-900 dark:text-red-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>预兆演进阶段 (Omens Phase 1 – 6)</span>
              </h4>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                点击复选框推进神话阴谋与异变
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {mythDef.omens.map((omenText, idx) => {
                const isChecked = activeInstance.checkedOmens[idx];
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-400/60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleOmen(idx)}
                      className="hidden"
                    />
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-400 hover:text-amber-600" />
                      )}
                    </div>
                    <div className="text-xs md:text-sm leading-relaxed space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                            isChecked
                              ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/40 dark:border-amber-800/60'
                          }`}
                        >
                          阶段 {idx + 1}
                        </span>
                        {isChecked && (
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                            已发生 (Triggered)
                          </span>
                        )}
                      </div>
                      <p className="font-serif">{omenText}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 关联角色与怪物 (Characters & Monsters) */}
          {mythDef.characters && mythDef.characters.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm md:text-base text-red-900 dark:text-red-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-700" />
                <span>关联角色与试炼怪物 (Characters & Creatures)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {mythDef.characters.map((char, cIdx) => (
                  <div
                    key={cIdx}
                    className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 hover:border-stone-300 dark:hover:border-stone-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-stone-200 dark:border-stone-700/60 pb-2">
                      <div className="font-bold font-serif text-stone-900 dark:text-stone-100 text-sm md:text-base">
                        {char.name}
                      </div>
                    </div>

                    {char.stats && (
                      <div className="text-xs font-mono font-bold text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg border border-red-200 dark:border-red-900/40 flex flex-wrap gap-1.5 items-center">
                        <Zap className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{char.stats}</span>
                      </div>
                    )}

                    <div className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-serif pt-1">
                      {char.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 专属随机表 (Specific Table) */}
          {mythDef.specificTable && (
            <SpecificTableInteractive table={mythDef.specificTable} />
          )}

          {/* 地理线索与风土提示 (Flavor) */}
          {mythDef.flavor && <FlavorBadgeSection flavorText={mythDef.flavor} />}

          {/* 战役笔记 (GM Notes) */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex justify-between items-center">
              <h4 className="font-serif font-bold text-sm text-red-900 dark:text-red-300 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>战役笔记与推演记录</span>
              </h4>
              <button
                className="btn btn-xs btn-ghost text-stone-600 dark:text-stone-300 cursor-pointer"
                onClick={() => setIsEditingNotes(!isEditingNotes)}
              >
                {isEditingNotes ? '完成编辑' : '修改笔记'}
              </button>
            </div>

            {isEditingNotes ? (
              <textarea
                className="form-input w-full font-serif text-xs md:text-sm p-3 rounded-xl"
                rows={4}
                placeholder="记录此神话在战役中的实际推进、玩家抉择与战术走向..."
                value={activeInstance.notes}
                onChange={e => onUpdateNotes(e.target.value)}
              />
            ) : (
              <div
                className="min-h-[60px] p-3.5 bg-stone-50 dark:bg-stone-800/30 border border-dashed border-stone-300 dark:border-stone-800 rounded-xl text-xs md:text-sm text-stone-700 dark:text-stone-300 font-serif whitespace-pre-line cursor-pointer hover:border-amber-500 transition-all"
                onClick={() => setIsEditingNotes(true)}
              >
                {activeInstance.notes || '点击此处输入团演记录、战术线索与玩家的推进决策...'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 专属随机表交互组件 (Specific Table Interactive)
 */
function SpecificTableInteractive({ table }: { table: MythSpecificTable }) {
  const [rolledResult, setRolledResult] = useState<{ roll: number; row: { col1: string; col2: string } } | null>(null);

  function handleRollD6() {
    const roll = Math.floor(Math.random() * 6) + 1;
    const targetRow = table.rows.find(r => r.roll === roll);
    if (targetRow) {
      setRolledResult({ roll, row: targetRow });
    }
  }

  return (
    <div className="bg-amber-50/40 dark:bg-stone-800/30 rounded-2xl border border-amber-300/60 dark:border-amber-900/40 p-4 space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200 dark:border-stone-700 pb-2.5">
        <div>
          <h4 className="font-serif font-bold text-sm md:text-base text-amber-950 dark:text-amber-200 flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-600" />
            <span>神话专属随机表: {table.name}</span>
          </h4>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            裁判可通过掷骰 d6 快速抽取该神话对应的遭遇细节、邪恶特征或战术意图。
          </p>
        </div>

        <button
          className="btn btn-xs sm:btn-sm btn-primary flex items-center gap-1.5 shrink-0 shadow-sm"
          onClick={handleRollD6}
        >
          <Dices className="w-4 h-4" />
          <span>🎲 掷骰 d6 抽取</span>
        </button>
      </div>

      {/* 掷骰结果展示 */}
      {rolledResult && (
        <div className="bg-amber-500/15 border-2 border-amber-500 p-3 rounded-xl flex items-center gap-3 animate-fade-in">
          <span className="w-9 h-9 rounded-full bg-amber-600 text-white font-mono font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
            {rolledResult.roll}
          </span>
          <div className="text-xs md:text-sm text-amber-950 dark:text-amber-100 font-serif leading-relaxed">
            <span className="font-bold text-amber-800 dark:text-amber-300 mr-2">
              [{table.headers[0]}] {rolledResult.row.col1}
            </span>
            <span className="text-stone-400 dark:text-stone-500 font-sans mx-1">|</span>
            <span className="font-bold text-amber-800 dark:text-amber-300">
              [{table.headers[1]}] {rolledResult.row.col2}
            </span>
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-amber-100/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-serif font-bold border-b border-amber-200 dark:border-stone-700">
              <th className="p-2.5 w-14 text-center font-mono">d6</th>
              <th className="p-2.5">{table.headers[0]}</th>
              <th className="p-2.5">{table.headers[1]}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-serif">
            {table.rows.map(row => {
              const isSelected = rolledResult?.roll === row.roll;
              return (
                <tr
                  key={row.roll}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-amber-500/20 font-semibold text-amber-950 dark:text-amber-100'
                      : 'hover:bg-amber-50 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <td className="p-2.5 text-center font-mono font-bold text-amber-800 dark:text-amber-400">
                    {row.roll}
                  </td>
                  <td className="p-2.5">{row.col1}</td>
                  <td className="p-2.5">{row.col2}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * 地理线索与风土分析渲染组件
 */
function FlavorBadgeSection({ flavorText }: { flavorText: string }) {
  // 解析 "聚落：牧羊人草场 ~ 圣所：低语涧 ~ 纪念碑：皇家雕像 | 灾害：窒息林地 ~ 诅咒：冰霜迷雾 ~ 遗迹：烧毁的村庄"
  const sections = flavorText.split('|').map(s => s.trim());
  const items: { label: string; val: string }[] = [];

  sections.forEach(sec => {
    const parts = sec.split('~').map(p => p.trim());
    parts.forEach(p => {
      const idx = p.indexOf('：');
      const idxAlt = p.indexOf(':');
      const splitIdx = idx !== -1 ? idx : idxAlt;
      if (splitIdx !== -1) {
        items.push({
          label: p.substring(0, splitIdx).trim(),
          val: p.substring(splitIdx + 1).trim(),
        });
      } else {
        items.push({ label: '提示', val: p });
      }
    });
  });

  return (
    <div className="bg-stone-100 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
      <div className="flex items-center gap-1.5 font-serif font-bold text-xs md:text-sm text-stone-800 dark:text-stone-200">
        <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
        <span>地理线索与风土遭遇提示 (Geography & Hazards)</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {items.map((item, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs shadow-2xs"
          >
            <span className="font-bold font-serif text-amber-800 dark:text-amber-400">
              {item.label}:
            </span>
            <span className="text-stone-700 dark:text-stone-300 font-serif">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 图鉴卡片组件 (Codex Myth Card)
 */
function CodexMythCard({
  myth,
  isExpanded,
  onToggleExpand,
  onActivate,
}: {
  myth: MythArchetype;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onActivate: () => void;
}) {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs hover:border-amber-500/50 transition-all">
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50/60 dark:bg-stone-800/40">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-stone-800 text-amber-300 font-mono font-bold text-xs rounded-md">
            {myth.number}
          </span>
          <div>
            <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
              {myth.name}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 italic line-clamp-1">
              “{myth.quote}”
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            className="btn btn-xs btn-ghost flex items-center gap-1 text-stone-600 dark:text-stone-300"
            onClick={onToggleExpand}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isExpanded ? '收起详情' : '查阅表格/预兆'}</span>
          </button>

          <button
            className="btn btn-xs btn-primary flex items-center gap-1 shadow-2xs"
            onClick={onActivate}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>加入战役</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 border-t border-stone-200 dark:border-stone-800 space-y-5 bg-white dark:bg-stone-900 animate-fade-in">
          {/* 引言 */}
          <blockquote className="italic font-serif text-stone-700 dark:text-stone-300 border-l-4 border-amber-600 pl-4 py-1 text-xs md:text-sm">
            “{myth.quote}”
          </blockquote>

          {/* 预兆列表 */}
          <div className="space-y-2">
            <h5 className="font-serif font-bold text-xs md:text-sm text-red-900 dark:text-red-300">
              预兆 1 – 6 阶段描述
            </h5>
            <div className="space-y-1.5 font-serif text-xs md:text-sm">
              {myth.omens.map((o, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-start gap-2">
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-400 shrink-0">
                    [{idx + 1}]
                  </span>
                  <span className="text-stone-800 dark:text-stone-200">{o}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 关联角色 */}
          {myth.characters && myth.characters.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-serif font-bold text-xs md:text-sm text-red-900 dark:text-red-300">
                关联角色与怪物
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myth.characters.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 space-y-1 text-xs">
                    <div className="font-bold text-stone-900 dark:text-stone-100 font-serif">{c.name}</div>
                    {c.stats && <div className="font-mono font-bold text-red-700 dark:text-red-400">{c.stats}</div>}
                    <div className="text-stone-600 dark:text-stone-300 font-serif leading-relaxed">{c.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 专属表 */}
          {myth.specificTable && <SpecificTableInteractive table={myth.specificTable} />}

          {/* 地理风土 */}
          {myth.flavor && <FlavorBadgeSection flavorText={myth.flavor} />}
        </div>
      )}
    </div>
  );
}
