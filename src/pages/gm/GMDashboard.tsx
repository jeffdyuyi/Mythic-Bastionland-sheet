import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCharacterStore } from '../../stores/useCharacterStore';
import { useGMStore } from '../../stores/useGMStore';
import { getRank, rollDie } from '../../data/gameTables';
import { getKnightLabel, getKnightById } from '../../data/knights';
import { Crown, Sparkles, BookOpen, Dices, Shield, Plus, Trash2, Eye, Upload, Download, Swords, RotateCcw } from 'lucide-react';
import type { Character, TemporaryNPC } from '../../types';
import { exportCampaignArchive, importCampaignArchive } from '../../utils/campaignArchive';

interface D6RollTable {
  crisis: string;   // d6 = 1
  problem: string;  // d6 = 2-3
  blessing: string; // d6 = 4-6
}

export default function GMDashboard() {
  const { characterIds, characters, adjustVirtueForChar, adjustGDForChar, importCharacter } = useCharacterStore();
  const { activeMythIds, npcs, addNpc, removeNpc, combatRound, adjustCombatRound, resetCombatRound } = useGMStore();

  const [quickRollLog, setQuickRollLog] = useState<string[]>([]);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  function handleExportCampaign() {
    exportCampaignArchive();
    setImportNotice('整场战役存档包 (包含角色、GM神话、地图探索) 已成功打包导出！');
    setTimeout(() => setImportNotice(null), 4000);
  }

  function handleImportCampaignFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const ok = importCampaignArchive(event.target?.result as string);
      if (ok) {
        setImportNotice('整场战役存档解包恢复成功！所有角色与地图数据已载入。');
        setTimeout(() => setImportNotice(null), 4000);
      } else {
        alert('无效的战役存档文件格式');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleImportKnightJson(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.id && json.name && json.virtues) {
          importCharacter(json as Character);
          setImportNotice(`成功导入骑士【${json.name}】到战团列表！`);
          setTimeout(() => setImportNotice(null), 4000);
        } else {
          alert('无效的角色卡 JSON 文件格式');
        }
      } catch {
        alert('读取 JSON 失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleGenerateSquire() {
    const vig = rollDie(6) + rollDie(6);
    const cla = rollDie(6) + rollDie(6);
    const spi = rollDie(6) + rollDie(6);
    const gearRoll = rollDie(6);
    const gearOptions = [
      '短棒 (d8 沉重)',
      '斧子 (d8 沉重)',
      '短柄斧 (d6)',
      '短弓 (d6 长)',
      '盾牌 (d4, A1护甲)',
      '三把标枪 (d6)',
    ];

    const squire: TemporaryNPC = {
      id: 'npc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      name: `侍从 ${Math.floor(Math.random() * 900 + 100)}`,
      type: '侍从',
      vig,
      cla,
      spi,
      gd: 1,
      gear: `匕首(d6), 骑着小马(VIG 7, CLA 7, SPI 2, 2 GD), 额外装备: ${gearOptions[gearRoll - 1]}`,
    };

    addNpc(squire);
  }

  function handleQuickRoll(title: string, table: D6RollTable) {
    const roll = rollDie(6);
    const resultText =
      roll === 1 ? table.crisis :
      roll <= 3  ? table.problem :
                   table.blessing;

    setQuickRollLog(prev => [
      `🎲 ${title} (d6 = ${roll}): ${resultText}`,
      ...prev.slice(0, 9),
    ]);
  }

  return (
    <div className="space-y-6">
      {/* 控制台头栏卡片 */}
      <div className="rules-section-hero">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-600" />
              <span>GM 控制台 & 战役管理中枢</span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* 战斗轮次计数器 */}
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>战斗轮次: <span className="text-amber-300 font-mono text-sm">{combatRound}</span></span>
              <div className="flex items-center gap-0.5 ml-1">
                <button className="btn btn-xs btn-ghost text-stone-300 hover:text-white px-1" onClick={() => adjustCombatRound(-1)}>−</button>
                <button className="btn btn-xs btn-ghost text-stone-300 hover:text-white px-1" onClick={() => adjustCombatRound(1)}>+</button>
                <button className="btn btn-xs btn-ghost text-amber-400 hover:text-amber-200 px-1" onClick={resetCombatRound} title="重置轮次为 1">
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button onClick={handleExportCampaign} className="btn btn-sm btn-ghost border border-amber-500/40 text-amber-200 hover:bg-amber-950/40 shadow-sm flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-400" />
              <span>打包导出全战役</span>
            </button>
            <label className="btn btn-sm btn-ghost border border-amber-500/40 text-amber-200 hover:bg-amber-950/40 shadow-sm cursor-pointer flex items-center gap-1.5 margin-0">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>导入战役包</span>
              <input type="file" accept=".json" onChange={handleImportCampaignFile} className="hidden" />
            </label>

            <Link to="/gm/myths" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm">
              <BookOpen className="w-4 h-4" />
              <span>神话战报 ({activeMythIds.length})</span>
            </Link>
            <Link to="/gm/sparks" className="btn btn-warning btn-sm flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>灵感火花</span>
            </Link>
          </div>
        </div>
        {importNotice && (
          <div className="mt-3 p-2.5 bg-emerald-900/20 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fade-in">
            {importNotice}
          </div>
        )}
      </div>

      {/* 战团角色卡片列表 */}
      <div className="detail-section-card">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
          <h3 className="detail-section-title border-none p-0">
            <Shield className="w-5 h-5 text-amber-700" />
            <span>战团成员实时状态 & 先知档案 ({characterIds.length})</span>
          </h3>
          <label className="btn btn-xs btn-ghost text-stone-500 hover:text-stone-800 cursor-pointer flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" />
            <span>导入玩家 JSON 存档</span>
            <input type="file" accept=".json" onChange={handleImportKnightJson} className="hidden" />
          </label>
        </div>

            {characterIds.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-500 text-sm space-y-2">
                <div>暂无玩家角色加入。让玩家创建角色，或点击上方“导入骑士 JSON”导入玩家导出的存档。</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {characterIds.map(id => {
                  const char = characters[id];
                  if (!char) return null;
                  const rank = getRank(char.glory);
                  const knightDef = getKnightById(char.knightType);

                  return (
                    <div
                      key={id}
                      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm hover:border-amber-500/50 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-2">
                        <span className="font-serif font-bold text-base text-red-900 dark:text-red-400">
                          {char.name}
                        </span>
                        <span className="px-2.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 rounded-full text-xs font-bold border border-red-200 dark:border-red-900">
                          {rank.rank}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                        {getKnightLabel(char.knightType)}
                      </div>

                      <div className="grid grid-cols-4 gap-2 bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded-lg text-center font-mono">
                        <div>
                          <div className="text-[10px] text-stone-400 font-bold uppercase">VIG</div>
                          <div className="font-bold text-sm text-stone-800 dark:text-stone-200">
                            {char.virtues.vig.current}/{char.virtues.vig.max}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-stone-400 font-bold uppercase">CLA</div>
                          <div className="font-bold text-sm text-stone-800 dark:text-stone-200">
                            {char.virtues.cla.current}/{char.virtues.cla.max}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-stone-400 font-bold uppercase">SPI</div>
                          <div className="font-bold text-sm text-stone-800 dark:text-stone-200">
                            {char.virtues.spi.current}/{char.virtues.spi.max}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-600 font-bold uppercase">GD</div>
                          <div className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                            {char.gd.current}/{char.gd.max}
                          </div>
                        </div>
                      </div>

                      {/* 🔮 GM 独享：册封先知秘辛与属性 */}
                      {knightDef && (
                        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-lg p-2.5 space-y-1 text-xs">
                          <div className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>册封先知秘辛: {knightDef.seer.name}</span>
                          </div>
                          <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                            {knightDef.seer.description}
                          </p>
                        </div>
                      )}

                      {/* 快捷微调 — 绑定此骑士的 id，不影响其他角色 */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <div className="flex items-center gap-1">
                          <button className="btn btn-xs btn-ghost" onClick={() => adjustVirtueForChar(id, 'vig', -1)}>VIG -1</button>
                          <button className="btn btn-xs btn-ghost" onClick={() => adjustVirtueForChar(id, 'vig', 1)}>VIG +1</button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="btn btn-xs btn-ghost" onClick={() => adjustGDForChar(id, -1)}>GD -1</button>
                          <button className="btn btn-xs btn-ghost" onClick={() => adjustGDForChar(id, 1)}>GD +1</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 常用 1d6 快捷检定 */}
          <div className="detail-section-card">
            <h3 className="detail-section-title">
              <Dices className="w-5 h-5 text-amber-700" />
              <span>常用战役 1d6 检定塔</span>
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <button
                  className="btn btn-sm btn-ghost border border-stone-200 dark:border-stone-800 shadow-sm"
                  onClick={() => handleQuickRoll('幸运骰', { crisis: '危机：迫在眉睫', problem: '问题：潜在危机', blessing: '祝福：良好结果' })}
                >
                  🎲 幸运骰
                </button>
                <button
                  className="btn btn-sm btn-ghost border border-stone-200 dark:border-stone-800 shadow-sm"
                  onClick={() => handleQuickRoll('时间流逝', { crisis: '跳至下个季节/时代', problem: '下次聚会后跳转', blessing: '维持当前季节/时代' })}
                >
                  ⏳ 时间流逝
                </button>
                <button
                  className="btn btn-sm btn-ghost border border-stone-200 dark:border-stone-800 shadow-sm"
                  onClick={() => handleQuickRoll('荒野检定', { crisis: '遭遇随机预兆', problem: '遭遇最近预兆', blessing: '遭遇六角格地标/无事发生' })}
                >
                  🌲 荒野检定
                </button>
                <button
                  className="btn btn-sm btn-ghost border border-stone-200 dark:border-stone-800 shadow-sm"
                  onClick={() => handleQuickRoll('天气检定', { crisis: '恶劣天气', problem: '威胁将至', blessing: '适合出行' })}
                >
                  ☁️ 天气检定
                </button>
              </div>

              {quickRollLog.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-stone-400">投骰历史 (最近 {quickRollLog.length} 条):</span>
                    <button
                      className="btn btn-xs btn-ghost text-stone-400 hover:text-stone-600"
                      onClick={() => setQuickRollLog([])}
                    >
                      清空日志
                    </button>
                  </div>
                  <div className="space-y-1">
                    {quickRollLog.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-xs font-bold transition-all ${
                          idx === 0
                            ? 'bg-red-900/15 border border-red-700/40 text-red-900 dark:text-red-300'
                            : 'bg-stone-100 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 opacity-80'
                        }`}
                      >
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 侍从与随行 NPC 卡片 */}
          <div className="detail-section-card">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <h3 className="detail-section-title border-none p-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>侍从与随行 NPC 列表 ({npcs.length})</span>
              </h3>
              <button className="btn btn-sm btn-primary flex items-center gap-1 shadow-sm" onClick={handleGenerateSquire}>
                <Plus className="w-4 h-4" />
                <span>抽取侍从</span>
              </button>
            </div>

            {npcs.length === 0 ? (
              <div className="p-6 text-center text-stone-500 text-xs bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                点击右上角“抽取侍从”一键生成属性与随机配重武器。
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {npcs.map(npc => (
                  <div key={npc.id} className="bg-stone-50 dark:bg-stone-900/60 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">{npc.name}</div>
                      <button className="text-stone-400 hover:text-red-600 transition" onClick={() => removeNpc(npc.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 p-1.5 rounded">
                      VIG {npc.vig} · CLA {npc.cla} · SPI {npc.spi} · GD {npc.gd}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{npc.gear}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
    </div>
  );
}
