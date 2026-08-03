import React from 'react';
import { useMapStore } from '../../stores/useMapStore';
import { X, Castle, Trees, Waves, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MapTemplatesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { applyTemplate, clearMap } = useMapStore();

  if (!isOpen) return null;

  const templates = [
    {
      id: 'knight_domain',
      title: '骑士领地与堡垒',
      desc: '中心矗立着壮丽城堡，四周环绕着磨坊镇与平原森林，适合经典骑士探险开局。',
      icon: Castle,
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    {
      id: 'misty_forest',
      title: '迷雾森林与古迹',
      desc: '密林遮天蔽日，泥泞沼泽与丘陵交错，隐藏着遗迹石圈与神话秘境。',
      icon: Trees,
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
    {
      id: 'coastal_isle',
      title: '海岸与远征岛屿',
      desc: '风暴深海、避风浅滩与海岸关口，非常适合水路远征或海岸战役。',
      icon: Waves,
      color: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            预设地图模板库
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {templates.map((t) => {
            const IconComp = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  applyTemplate(t.id);
                  onClose();
                }}
                className="w-full p-4 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 bg-stone-50/50 dark:bg-stone-800/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/30 transition text-left flex items-start gap-3.5 group cursor-pointer"
              >
                <div className={`p-3 rounded-xl ${t.color}`}>
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                    {t.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={() => {
              if (confirm('确定要清空当前地图吗？')) {
                clearMap();
                onClose();
              }
            }}
            className="w-full py-2.5 px-4 bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-stone-600 hover:text-rose-700 dark:text-stone-400 dark:hover:text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> 清空网格并新建空白地图
          </button>
        </div>
      </div>
    </div>
  );
};
