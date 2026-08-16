import React, { useState } from 'react';
import { useMapStore } from '../../stores/useMapStore';
import { X, Sliders } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MapSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    width,
    height,
    hexSize,
    setGridDimensions,
    sightDistance,
    setSightDistance,
    revealMode,
    setRevealMode,
  } = useMapStore();
  const [wInput, setWInput] = useState(width);
  const [hInput, setHInput] = useState(height);
  const [sizeInput, setSizeInput] = useState(hexSize);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGridDimensions(
      Math.max(4, Math.min(30, wInput)),
      Math.max(4, Math.min(25, hInput)),
      Math.max(20, Math.min(80, sizeInput))
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
        <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-700 dark:text-amber-500" />
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              地图与网格参数设置
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
              地图宽度 (六边形格数: 4 ~ 30)
            </label>
            <input
              type="number"
              min={4}
              max={30}
              value={wInput}
              onChange={(e) => setWInput(parseInt(e.target.value, 10) || 12)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
              地图高度 (六边形格数: 4 ~ 25)
            </label>
            <input
              type="number"
              min={4}
              max={25}
              value={hInput}
              onChange={(e) => setHInput(parseInt(e.target.value, 10) || 10)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
              六边形大小 (像素: 20 ~ 80px)
            </label>
            <input
              type="number"
              min={20}
              max={80}
              value={sizeInput}
              onChange={(e) => setSizeInput(parseInt(e.target.value, 10) || 42)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm text-stone-800 dark:text-stone-200"
            />
          </div>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                  骑士战团视野距离 (GM 控制)
                </label>
                <span className="font-mono text-xs font-bold text-amber-600">{sightDistance} 格</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={sightDistance}
                onChange={(e) => setSightDistance(parseInt(e.target.value, 10))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                迷雾探知模式 (GM 控制)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRevealMode('permanent')}
                  className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer ${
                    revealMode === 'permanent'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  📜 永久记忆模式
                </button>
                <button
                  type="button"
                  onClick={() => setRevealMode('los')}
                  className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer ${
                    revealMode === 'los'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  🌫️ 动态视线 (LOS)
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-xl text-xs font-semibold cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              保存调整
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
