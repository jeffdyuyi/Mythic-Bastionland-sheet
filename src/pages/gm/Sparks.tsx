import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { SPARKS_DB } from '../../data/sparks';
import { rollDice } from '../../utils/dice';
import type { SparkCategoryData } from '../../types';
import { Sparkles, Dices, Image as ImageIcon, Trash2, Edit3 } from 'lucide-react';

type CategoryKey = keyof typeof SPARKS_DB;

interface SparkResult {
  id: string;
  categoryName: string;
  tableName: string;
  leftResult: string;
  rightResult: string;
  notes: string;
  timestamp: number;
}

const CATEGORY_NAMES: Record<CategoryKey, string> = {
  nature: "🌲 自然",
  civilization: "🏰 文明",
  people: "👤 人物",
  combat: "⚔️ 战斗"
};

export default function Sparks() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('nature');
  const [history, setHistory] = useState<SparkResult[]>([]);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleRoll = (tableName: string, tableData: SparkCategoryData[string]) => {
    const leftRoll = rollDice(12) - 1;
    const rightRoll = rollDice(12) - 1;

    const result: SparkResult = {
      id: 'spark_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      categoryName: CATEGORY_NAMES[selectedCategory],
      tableName,
      leftResult: tableData.left[leftRoll],
      rightResult: tableData.right[rightRoll],
      notes: '',
      timestamp: Date.now()
    };

    setHistory(prev => [result, ...prev]);
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
  };

  const handleRemoveSpark = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleExportPng = async (id: string, tableName: string) => {
    const elem = cardRefs.current[id];
    if (!elem) return;

    setExportingId(id);
    try {
      const canvas = await html2canvas(elem, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f7f3e9',
      });
      const imgData = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgData;
      a.download = `灵感火花_${tableName}.png`;
      a.click();
    } catch (err) {
      console.error('PNG export failed:', err);
      alert('导出图片失败');
    } finally {
      setExportingId(null);
    }
  };

  const currentCategoryData = SPARKS_DB[selectedCategory];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 头部英雄卡片 */}
      <div className="rules-section-hero">
        <h2 className="text-2xl font-bold font-serif text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-600 animate-pulse" />
          <span>灵感火花生成器 (Sparks 2d12)</span>
        </h2>
        <p className="rules-intro">
          选择四大维度随机表组合生成突发场景与叙事片段，记录团演笔记并可一键卡片式导出为精美图片。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧：表选择与分类 */}
        <div className="md:col-span-1 space-y-4">
          {/* 分类切换 */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-stone-200 dark:bg-stone-800 rounded-2xl">
            {(Object.keys(CATEGORY_NAMES) as CategoryKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === key
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                {CATEGORY_NAMES[key]}
              </button>
            ))}
          </div>

          {/* 表列表按钮组 */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3 shadow-sm space-y-1.5 max-h-[60vh] overflow-y-auto">
            {Object.entries(currentCategoryData).map(([tableName, tableData]) => (
              <button
                key={tableName}
                onClick={() => handleRoll(tableName, tableData)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all text-left group cursor-pointer"
              >
                <span className="font-serif font-bold text-xs text-red-900 dark:text-red-300 group-hover:text-amber-800">
                  {tableName}
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full">
                  2d12 抽取
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 右侧：抽取生成的火花卡片历史 */}
        <div className="md:col-span-2 space-y-4">
          {history.length === 0 ? (
            <div className="p-12 text-center bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 space-y-2">
              <Dices className="w-10 h-10 text-amber-600 mx-auto opacity-50" />
              <h3 className="font-bold text-stone-700 dark:text-stone-300">暂无生成的灵感火花</h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                点击左侧随机分类表项，投掷 2d12 碰撞出故事火花。
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((result) => (
                <div
                  key={result.id}
                  ref={el => { cardRefs.current[result.id] = el; }}
                  className="bg-white dark:bg-stone-900 border-2 border-amber-600/40 rounded-2xl shadow-md overflow-hidden space-y-3"
                >
                  <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-amber-200">
                      {result.categoryName} · {result.tableName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-xs btn-primary flex items-center gap-1 shadow-sm"
                        onClick={() => handleExportPng(result.id, result.tableName)}
                        disabled={exportingId === result.id}
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>{exportingId === result.id ? '导出中...' : '导出图片'}</span>
                      </button>
                      <button className="text-stone-400 hover:text-red-400 transition" onClick={() => handleRemoveSpark(result.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="font-serif text-lg md:text-xl font-extrabold text-stone-900 dark:text-stone-100 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 leading-relaxed">
                      【<span className="text-red-800 dark:text-red-400">{result.leftResult}</span>】的
                      【<span className="text-emerald-800 dark:text-emerald-400">{result.rightResult}</span>】
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5" /> 团演笔记与现场推演:
                      </label>
                      <textarea
                        className="form-input w-full text-xs font-serif p-2.5 rounded-xl"
                        rows={2}
                        placeholder="在此补充剧情细节、地理描述或 NPC 对话..."
                        value={result.notes}
                        onChange={e => handleUpdateNotes(result.id, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
