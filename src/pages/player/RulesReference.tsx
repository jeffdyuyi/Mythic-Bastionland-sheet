import { useState } from 'react';
import { SCAR_TABLE, RANK_THRESHOLDS, GAMBITS, FEATS, rollDie } from '../../data/gameTables';
import { Zap, Swords, Activity, Award, ShieldAlert, Dices, AlertTriangle, Flame, HeartPulse } from 'lucide-react';

type RulesTab = 'feats' | 'gambits' | 'scars' | 'ranks' | 'damage';

export default function RulesReference() {
  const [activeTab, setActiveTab] = useState<RulesTab>('feats');

  const tabs: { key: RulesTab; label: string; icon: React.ReactNode }[] = [
    { key: 'feats', label: '绝技 (Feats)', icon: <Zap className="w-4 h-4 text-amber-600" /> },
    { key: 'gambits', label: '策略 (Gambits)', icon: <Swords className="w-4 h-4 text-crimson-primary" /> },
    { key: 'scars', label: '伤痕表 (Scars)', icon: <ShieldAlert className="w-4 h-4 text-rose-600" /> },
    { key: 'ranks', label: '等阶与荣耀 (Ranks)', icon: <Award className="w-4 h-4 text-amber-500" /> },
    { key: 'damage', label: '伤害结算流程 (Damage)', icon: <Activity className="w-4 h-4 text-emerald-600" /> },
  ];

  return (
    <div className="rules-reference">
      <div className="rules-tab-bar">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab-btn ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="rules-content">
        {activeTab === 'feats' && <FeatsTab />}
        {activeTab === 'gambits' && <GambitsTab />}
        {activeTab === 'scars' && <ScarsTab />}
        {activeTab === 'ranks' && <RanksTab />}
        {activeTab === 'damage' && <DamageTab />}
      </div>
    </div>
  );
}

function FeatsTab() {
  return (
    <div className="rules-section">
      <div className="rules-section-hero">
        <h2>
          <Zap className="w-6 h-6 text-amber-600" />
          <span>战技 Feats</span>
        </h2>
        <p className="rules-intro font-serif text-stone-700 dark:text-stone-300 leading-relaxed">
          在使用一项战技后，角色必须通过一次豁免，否则会陷入<strong>疲劳</strong>，直到休息前都无法再次使用战技。在每次攻击中，每个参战者只能使用一次特定战技。
        </p>
      </div>

      <div className="feats-grid">
        {Object.values(FEATS).map(feat => (
          <div key={feat.name} className="feat-card border-2 border-stone-300 dark:border-stone-800 p-5 rounded-2xl bg-white dark:bg-stone-900 shadow-md">
            <div className="feat-card-header mb-2 flex items-center justify-between border-b pb-2 border-stone-200 dark:border-stone-800">
              <div>
                <span className="feat-card-name text-lg font-bold font-serif text-red-900 dark:text-red-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  {feat.name}
                </span>
                {feat.subtitle && (
                  <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 italic mt-0.5">
                    - {feat.subtitle}
                  </div>
                )}
              </div>
              <span className="feat-save-badge bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 text-xs font-bold px-2.5 py-1 rounded-full border border-red-300 dark:border-red-800">
                {feat.save} 豁免
              </span>
            </div>

            {feat.bullets ? (
              <ul className="text-xs text-stone-700 dark:text-stone-300 space-y-1.5 list-disc pl-5 mt-3">
                {feat.bullets.map((b, i) => (
                  <li key={i} className="leading-relaxed">{b}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{feat.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GambitsTab() {
  const standard = GAMBITS.filter(g => !g.strong);
  const strong = GAMBITS.filter(g => g.strong);

  return (
    <div className="rules-section">
      <div className="rules-section-hero">
        <h2>
          <Swords className="w-6 h-6 text-red-700" />
          <span>策略 (Gambits) 触发机制</span>
        </h2>
        <p className="rules-intro">
          当你的攻击骰池中出现两个或两个以上相同点数的骰子（如双自然 6 或双 10）时，触发策略。你可以选择执行一项匹配的策略效果。强效策略要求匹配点数达到 8 或 8 以上。
        </p>
      </div>

      {/* 基础策略 */}
      <div className="gambit-section-block">
        <h3 className="gambit-section-title">
          <Dices className="w-5 h-5 text-amber-700" />
          <span>基础策略 (Standard Gambits — 任何匹配点数)</span>
        </h3>
        <div className="gambits-grid">
          {standard.map(g => (
            <div key={g.name} className="gambit-item-card">
              <div className="gambit-card-top">
                <span className="gambit-name">🎲🎲 {g.name}</span>
                <span className="text-xs font-semibold text-stone-500">基础</span>
              </div>
              <span className="gambit-effect">{g.effect}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 强效策略 */}
      <div className="gambit-section-block">
        <h3 className="gambit-section-title text-red-800">
          <Flame className="w-5 h-5 text-red-600" />
          <span>强效策略 (Strong Gambits — 匹配点数 ≥ 8)</span>
        </h3>
        <div className="gambits-grid">
          {strong.map(g => (
            <div key={g.name} className="gambit-item-card strong">
              <div className="gambit-card-top">
                <span className="gambit-name">🔥 {g.name}</span>
                <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  点数 ≥ 8
                </span>
              </div>
              <span className="gambit-effect">{g.effect}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScarsTab() {
  const [result, setResult] = useState<{ sides: number; roll: number } | null>(null);

  function rollScar(sides: number) {
    const roll = rollDie(sides);
    setResult({ sides, roll });
  }

  const scarEntry = result
    ? SCAR_TABLE[Math.min(result.roll - 1, SCAR_TABLE.length - 1)]
    : null;

  return (
    <div className="rules-section">
      <div className="rules-section-hero">
        <h2>
          <ShieldAlert className="w-6 h-6 text-rose-600" />
          <span>伤痕表 (Scars Table - 1d12)</span>
        </h2>
        <p className="rules-intro">
          触发条件：当单次伤害刚好将你的防护 (GD) 扣减至精确的 0 时，获得伤疤。选择任意骰子掷骰——骰子面数越高，伤疤后果越严重。
        </p>
      </div>

      {/* 模拟掷骰卡片 */}
      <div className="scar-roller-card">
        <div className="flex items-center gap-2 font-bold text-stone-800 dark:text-stone-200">
          <Dices className="w-5 h-5 text-amber-700" />
          <span>在线伤痕快捷掷骰:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[4, 6, 8, 10, 12].map(sides => (
            <button
              key={sides}
              className="btn btn-primary btn-sm"
              onClick={() => rollScar(sides)}
            >
              d{sides}
            </button>
          ))}
        </div>
      </div>

      {/* 掷骰结果展示盒 */}
      {scarEntry && result && (
        <div className="bg-red-900/10 border-2 border-red-700/40 rounded-2xl p-5 shadow-lg space-y-2 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-700 text-white rounded-full text-xs font-bold">
            <Dices className="w-3.5 h-3.5" />
            <span>d{result.sides} 投出点数: {result.roll}</span>
          </div>
          <h3 className="text-xl font-bold text-red-900 dark:text-red-300 font-serif">
            {scarEntry.name}
          </h3>
          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            {scarEntry.description}
          </p>
          <div className="text-sm font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/50 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
            ⚖️ 效果: {scarEntry.effect}
          </div>
        </div>
      )}

      {/* 完整伤痕表卡片 */}
      <div className="scar-table-container">
        {SCAR_TABLE.map(entry => (
          <div
            key={entry.roll}
            className={`scar-table-row ${entry.isDoom ? 'doom-row' : ''} ${
              result?.roll === entry.roll ? 'highlighted' : ''
            }`}
          >
            <div className="scar-roll-badge-cell">
              {entry.roll}
            </div>
            <div className="scar-info">
              <div className="scar-entry-name">
                <span>{entry.name}</span>
                {entry.isDoom && (
                  <span className="text-xs font-bold text-white bg-red-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> 毁灭伤痕 (Doom Scar)
                  </span>
                )}
              </div>
              <div className="scar-entry-desc">{entry.description}</div>
              <div className="scar-entry-effect">{entry.effect}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RanksTab() {
  return (
    <div className="rules-section">
      <div className="rules-section-hero">
        <h2>
          <Award className="w-6 h-6 text-amber-500" />
          <span>骑士身份与荣耀等阶 (Knighthood, Glory & Ranks)</span>
        </h2>
        <p className="rules-intro">
          荣耀 (Glory) 是骑士通过完成伟大使命、遵守誓言与克服史诗险境所获得的永恒记录。积累荣耀值可提升骑士等阶，获得地位与册封特权。
        </p>
      </div>

      {/* 骑士三大誓言 */}
      <div className="bg-amber-950/10 border border-amber-600/30 rounded-2xl p-5 mb-4 space-y-2">
        <h3 className="font-serif font-bold text-base text-amber-900 dark:text-amber-300 flex items-center gap-2">
          📜 骑士三大誓言 (Oath of Knighthood)
        </h3>
        <p className="text-xs text-stone-600 dark:text-stone-300">
          每一位圣堡之地的骑士均受三大誓言的约束与指引：
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-amber-200 dark:border-stone-800">
            <div className="font-bold text-sm text-amber-800 dark:text-amber-400">1. 探寻神话 (Seek Myths)</div>
            <p className="text-xs text-stone-500 mt-1">追寻国度中潜伏的太古神话与异象，不向未知退缩。</p>
          </div>
          <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-amber-200 dark:border-stone-800">
            <div className="font-bold text-sm text-amber-800 dark:text-amber-400">2. 尊崇先知 (Heed Seers)</div>
            <p className="text-xs text-stone-500 mt-1">聆听先知的预言与警告，遵循古老的信条与仪式。</p>
          </div>
          <div className="bg-white dark:bg-stone-900 p-3 rounded-xl border border-amber-200 dark:border-stone-800">
            <div className="font-bold text-sm text-amber-800 dark:text-amber-400">3. 保护国度 (Protect Realm)</div>
            <p className="text-xs text-stone-500 mt-1">挺身而出庇护领民与土地，抵御毁灭性的灾祸与威胁。</p>
          </div>
        </div>
      </div>

      {/* 等阶列表 */}
      <div className="ranks-grid mb-6">
        {RANK_THRESHOLDS.map(r => (
          <div key={r.rank} className="rank-card">
            <div className="rank-glory-pill">
              ⭐ {r.glory}+ 荣耀值
            </div>
            <h3 className="rank-title">{r.rank}</h3>
            <p className="rank-worthy">{r.worthy}</p>
          </div>
        ))}
      </div>

      {/* 侍从与随从规则 */}
      <div className="bg-stone-100 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-2xl p-5 space-y-3">
        <h3 className="font-serif font-bold text-base text-stone-800 dark:text-stone-200 flex items-center gap-2">
          🛡️ 侍从与侍从册封 (Squires & Elevation)
        </h3>
        <ul className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 list-disc pl-5">
          <li><strong>侍从配备条件</strong>：当队伍中仅有 1 或 2 名骑士时，每名骑士免费获得一名侍从帮衬。</li>
          <li><strong>侍从属性</strong>：三大美德属性（活力、敏锐、精神）各投掷 2d6 决定，防护为 1 点。携带匕首 (d6) 与小马 (7 活力, 7 敏锐, 2 精神, 2 防护)。</li>
          <li><strong>侍从限制</strong>：侍从无法积累荣耀值，也无法施展骑士绝技。</li>
          <li><strong>册封提升</strong>：当侍从完成考验并被正式册封为骑士后，其三项美德属性均永久提升 d6 点。</li>
        </ul>
      </div>
    </div>
  );
}

function DamageTab() {
  return (
    <div className="rules-section">
      <div className="rules-section-hero">
        <h2>
          <Activity className="w-6 h-6 text-emerald-600" />
          <span>基础规则、伤害结算与战斗详情</span>
        </h2>
        <p className="rules-intro">
          严格遵循《神话堡垒之地》规则书【基础规则】、【伤害与伤痕】与【战斗详情】全套核心机制。
        </p>
      </div>

      {/* 基础规则卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-2">
          <h3 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 flex items-center gap-2">
            🎲 美德豁免检定 (Virtue Saves)
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            当面临危险或使用绝技后，投掷 <strong>1d20</strong> 进行检定。若结果<strong>小于或等于</strong>对应的美德数值，则检定成功；点数为 1 判定为大成功，点数为 20 判定为大失败。
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-2">
          <h3 className="font-serif font-bold text-sm text-stone-800 dark:text-stone-200 flex items-center gap-2">
            🍀 幸运骰检定 (Luck Rolls)
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            遭遇未知境遇或无法确定后果时，GM 投掷 <strong>1d6</strong> 幸运骰：<br />
            • <strong>1</strong>：迫在眉睫的危机<br />
            • <strong>2 - 3</strong>：潜在的隐患问题<br />
            • <strong>4 - 6</strong>：极佳的幸免与祝福
          </p>
        </div>
      </div>

      {/* 6步伤害流程 */}
      <div className="damage-flow-timeline mb-6">
        <div className="damage-step-card">
          <div className="damage-step-num">1</div>
          <div className="damage-step-body">
            <strong>掷攻击骰 (Roll Attack)</strong>：选取攻击骰池中单颗最高点数作为原始受击伤害。（沉重武器掷两颗取较高者，被压制或徒手攻击仅投 d4。）
          </div>
        </div>

        <div className="damage-step-card">
          <div className="damage-step-num">2</div>
          <div className="damage-step-body">
            <strong>扣减防具护甲 (Subtract Armour)</strong>：自原始受击伤害中扣除目标装备的护甲值（A1 / A2 / A3 / A4）。
          </div>
        </div>

        <div className="damage-step-card">
          <div className="damage-step-num">3</div>
          <div className="damage-step-body">
            <strong>优先抵扣防护 (GD First)</strong>：实际伤害优先扣减防护 (GD)。若单次受击恰好将防护扣减至 <strong>精确 0</strong> 点 → 重掷攻击武器骰查伤疤表获得伤疤。
          </div>
        </div>

        <div className="damage-step-card">
          <div className="damage-step-num">4</div>
          <div className="damage-step-body">
            <strong>溢出伤害扣减活力 (Excess to Vigour)</strong>：超越防护 (GD) 的剩余实际伤害，直接从活力 (VIG) 中扣除。
          </div>
        </div>

        <div className="damage-step-card">
          <div className="damage-step-num">5</div>
          <div className="damage-step-body">
            <strong>致命伤判定 (Mortal Wound)</strong>：若单次受创失去的活力值 ≥ 受击前剩余活力的一半 → 目标陷入致命伤状态（若 1 小时内未获照顾将死亡）。
          </div>
        </div>

        <div className="damage-step-card">
          <div className="damage-step-num">6</div>
          <div className="damage-step-body">
            <strong>阵亡判定 (Slain)</strong>：若活力归 0，或者在带有一项【毁灭】伤痕 (Doom Scar) 状态下再次遭受致命伤 → 骑士阵亡。
          </div>
        </div>
      </div>

      {/* 美德归零惩罚卡片 */}
      <div className="bg-amber-900/10 border border-amber-600/30 rounded-2xl p-5 space-y-3">
        <h3 className="font-serif font-bold text-base text-amber-900 dark:text-amber-300 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-amber-700" />
          <span>美德归零惩罚与不利状态 (Virtue Depletion & Conditions)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="text-xs font-bold text-red-700 uppercase tracking-wider">活力 (Vigour) = 0</div>
            <div className="text-sm font-bold text-stone-800 dark:text-stone-200">力竭 (Exhausted)</div>
            <p className="text-xs text-stone-500 dark:text-stone-400">身体极度透支，本回合内若进行了移动则无法再发动攻击。</p>
          </div>
          <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">敏锐 (Clarity) = 0</div>
            <div className="text-sm font-bold text-stone-800 dark:text-stone-200">暴露 (Exposed)</div>
            <p className="text-xs text-stone-500 dark:text-stone-400">感官迟钝崩溃，防护 (GD) 视作 0，所有受击伤害直接扣减活力。</p>
          </div>
          <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">精神 (Spirit) = 0</div>
            <div className="text-sm font-bold text-stone-800 dark:text-stone-200">压制 (Impaired)</div>
            <p className="text-xs text-stone-500 dark:text-stone-400">斗志受挫沮丧，所有攻击骰与美德检定限定仅能投掷 d4。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

