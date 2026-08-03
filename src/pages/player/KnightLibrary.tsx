import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KNIGHT_DB, getKnightGroups } from '../../data/knights';
import type { KnightArchetype } from '../../types';
import { Zap, Flame, Package, Eye, Shield, Swords, Sparkles, Compass, Dices } from 'lucide-react';

export default function KnightLibrary() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<KnightArchetype | null>(null);
  const [groupFilter, setGroupFilter] = useState<string>('all');

  const groups = getKnightGroups();
  const groupKeys = Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b));

  const filtered = KNIGHT_DB.filter(k => {
    const matchesSearch = !search ||
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.ability.name.toLowerCase().includes(search.toLowerCase()) ||
      k.passion.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = groupFilter === 'all' || k.number.startsWith(groupFilter + '-');
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="knight-library">
      <div className="library-sidebar">
        <div className="library-filters">
          <input
            type="text"
            className="form-input"
            placeholder="搜索骑士名称、能力或热忱..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="group-filter-tabs">
            <button
              className={`filter-tab ${groupFilter === 'all' ? 'active' : ''}`}
              onClick={() => setGroupFilter('all')}
            >全部 (72)</button>
            {groupKeys.map(g => (
              <button
                key={g}
                className={`filter-tab ${groupFilter === g ? 'active' : ''}`}
                onClick={() => setGroupFilter(g)}
              >第 {g} 组</button>
            ))}
          </div>
        </div>

        <div className="knight-list">
          {filtered.map(k => (
            <div
              key={k.id}
              className={`knight-list-item ${selected?.id === k.id ? 'active' : ''}`}
              onClick={() => setSelected(k)}
            >
              <div className="knight-number">{k.number}</div>
              <div className="knight-list-name">{k.name}</div>
              <div className="knight-passion-preview">{k.passion.name}</div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state-sm">未找到匹配的骑士原型。</div>
          )}
        </div>
      </div>

      <div className="library-detail">
        {!selected ? (
          <div className="library-placeholder flex flex-col items-center justify-center p-8 text-center">
            <Compass className="w-12 h-12 text-amber-700 mb-2 opacity-60 animate-spin-slow" />
            <p className="font-semibold text-stone-600 dark:text-stone-400">请在左侧列表中选择一位骑士原型查看完整档案与试炼法宝</p>
          </div>
        ) : (
          <KnightDetail knight={selected} />
        )}
      </div>
    </div>
  );
}

function KnightDetail({ knight }: { knight: KnightArchetype }) {
  const [showSeer, setShowSeer] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="knight-detail-card-layout space-y-5">
      {/* 头部英雄名片 */}
      <div className="knight-detail-header-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-700 text-white font-mono font-bold text-xs rounded-full">
              NO. {knight.number}
            </span>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
              MYTHIC KNIGHT ARCHETYPE
            </span>
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            {knight.name}
          </h2>
          <blockquote className="italic font-serif text-amber-900 dark:text-amber-300 border-l-4 border-amber-600 pl-4 py-1.5 text-sm bg-amber-500/5 rounded-r-lg">
            “{knight.flavor}”
          </blockquote>
        </div>

        <button
          className="btn btn-primary btn-sm flex items-center gap-1.5 shrink-0 shadow-md"
          onClick={() => navigate('/player', { state: { preselectedKnightId: knight.id } })}
        >
          <Swords className="w-4 h-4" />
          <span>以此骑士原型创建角色</span>
        </button>
      </div>

      {/* ⚡ 能力 */}
      <div className="detail-section-card">
        <h3 className="detail-section-title">
          <Zap className="w-5 h-5 text-amber-600 shrink-0" />
          <span>特殊能力 (Ability) — {knight.ability.name}</span>
        </h3>
        <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed bg-stone-100 dark:bg-stone-900/60 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
          {knight.ability.description}
        </p>
      </div>

      {/* 🔥 热忱 */}
      <div className="detail-section-card">
        <h3 className="detail-section-title">
          <Flame className="w-5 h-5 text-red-600 shrink-0" />
          <span>骑士热忱 (Passion) — {knight.passion.name}</span>
        </h3>
        <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed bg-stone-100 dark:bg-stone-900/60 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
          {knight.passion.description}
        </p>
      </div>

      {/* 📦 初始财产与法宝 */}
      <div className="detail-section-card">
        <h3 className="detail-section-title">
          <Package className="w-5 h-5 text-amber-700 shrink-0" />
          <span>初始装备与战团财产 (Starting Gear & Property)</span>
        </h3>
        <div className="property-card-grid">
          {knight.property.map((p, i) => {
            if (p.type === 'weapon') {
              const w = p as { type: 'weapon'; name: string; dice: string; tags: string[]; note?: string };
              return (
                <div key={i} className="property-card-item">
                  <Swords className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{w.name}</span>
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-mono font-bold rounded-full border border-red-200">
                        {w.dice}
                      </span>
                    </div>
                    {w.tags && w.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {w.tags.map(t => (
                          <span key={t} className="text-[10px] font-semibold bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {w.note && <div className="text-xs text-stone-500 italic">{w.note}</div>}
                  </div>
                </div>
              );
            }
            if (p.type === 'armour') {
              const a = p as { type: 'armour'; name: string; armourType: string; score: number; dice?: string; note?: string };
              return (
                <div key={i} className="property-card-item">
                  <Shield className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{a.name}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-full border border-emerald-200">
                        A{a.score}
                      </span>
                    </div>
                    {a.dice && <div className="text-xs text-emerald-700 font-semibold">附加攻击骰: {a.dice}</div>}
                    {a.note && <div className="text-xs text-stone-500 italic">{a.note}</div>}
                  </div>
                </div>
              );
            }
            if (p.type === 'mount') {
              const m = p as { type: 'mount'; name: string; vig: number; cla: number; spi: number; gd: number; trample?: string; armour?: number; note?: string };
              return (
                <div key={i} className="property-card-item border-l-4 border-amber-600">
                  <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">{m.name}</div>
                    <div className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 p-1.5 rounded">
                      VIG {m.vig} · CLA {m.cla} · SPI {m.spi} · GD {m.gd}
                      {m.trample && ` · 践踏 ${m.trample}`}
                      {m.armour && ` · 护甲 A${m.armour}`}
                    </div>
                    {m.note && <div className="text-xs text-stone-500 italic">{m.note}</div>}
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="property-card-item">
                <Package className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
                <span className="font-bold text-sm text-stone-800 dark:text-stone-200">{p.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎲 骑士专属随机表 */}
      {knight.specificTable && (
        <div className="detail-section-card border-l-4 border-amber-600 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="detail-section-title border-none p-0 text-amber-900 dark:text-amber-200">
              <Dices className="w-5 h-5 text-amber-600 shrink-0" />
              <span>骑士专属表 — {knight.specificTable.name} (1d6)</span>
            </h3>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-amber-950/10 text-amber-900 dark:text-amber-300 font-bold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="p-2.5 w-12 text-center">d6</th>
                  <th className="p-2.5">{knight.specificTable.headers[0]}</th>
                  <th className="p-2.5">{knight.specificTable.headers[1]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {knight.specificTable.rows.map(row => (
                  <tr key={row.roll} className="hover:bg-stone-50 dark:hover:bg-stone-900/40">
                    <td className="p-2.5 font-bold text-center text-amber-700 dark:text-amber-400 bg-stone-50 dark:bg-stone-900/60">{row.roll}</td>
                    <td className="p-2.5 font-semibold text-stone-800 dark:text-stone-200">{row.col1}</td>
                    <td className="p-2.5 text-stone-600 dark:text-stone-300">{row.col2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🔮 册封先知 */}
      <div className="detail-section-card border-l-4 border-indigo-600 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="detail-section-title border-none p-0 text-indigo-900 dark:text-indigo-300">
            <Eye className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>册封先知 (Conferring Seer) — {knight.seer.name}</span>
          </h3>
          <button
            onClick={() => setShowSeer(!showSeer)}
            className="text-xs text-indigo-700 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            {showSeer ? '收起先知详细设定' : '查看先知详细设定'}
          </button>
        </div>

        {showSeer ? (
          <div className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed bg-indigo-50/50 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50">
            <p>{knight.seer.description}</p>
          </div>
        ) : (
          <p className="text-xs text-stone-500 dark:text-stone-400 italic bg-stone-100 dark:bg-stone-900/60 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
            🔒 册封先知的属性、特征与行为动机属于探索信息。点击右上角“查看先知详细设定”可展开规则书原文描述。
          </p>
        )}
      </div>
    </div>
  );
}
