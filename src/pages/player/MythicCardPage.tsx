import React, { useState, useRef } from 'react';
import { useCharacterStore } from '../../stores/useCharacterStore';
import MythicCharacterCard from '../../components/player/MythicCharacterCard';
import { exportCharacterJson, exportCharacterPdf, exportCharacterHtml } from '../../utils/exportUtils';

export default function MythicCardPage() {
  const { currentCharacter, updateCurrentCharacter, importCharacter } = useCharacterStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'classic' | 'parchment'>('parchment');
  const [isEditable, setIsEditable] = useState(false);
  const [showGMSecrets, setShowGMSecrets] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  if (!currentCharacter) {
    return (
      <div className="empty-state">
        <p>未找到当前骑士，请先在控制台创建或选择一位骑士。</p>
      </div>
    );
  }

  // ================= 1. JSON Export =================
  const handleExportJson = () => {
    const filename = exportCharacterJson(currentCharacter);
    showToast(`💾 导出 JSON 存档: ${filename}`);
  };

  // ================= 2. JSON Reverse Import =================
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json || typeof json !== 'object') {
          throw new Error('无效的 JSON 内容');
        }
        const importedId = importCharacter(json);
        if (importedId) {
          showToast(`🎉 成功导入骑士角色卡: ${json.name || '未命名'}`);
        } else {
          showToast(`⚠️ 导入失败: JSON 数据缺少必要字段`);
        }
      } catch (err) {
        showToast(`❌ 导入错误: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ================= 3. PDF Export =================
  const handleExportPdf = async () => {
    if (!cardRef.current) return;
    setIsExportingPdf(true);
    showToast('⏳ 正在渲染高质量 PDF 角色卡...');

    try {
      const filename = await exportCharacterPdf(cardRef.current, currentCharacter.name, theme);
      showToast(`📄 PDF 角色卡导出成功: ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('❌ PDF 导出失败，请重试或使用浏览器打印功能');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ================= 4. Standalone HTML Export =================
  const handleExportHtml = () => {
    if (!cardRef.current) return;
    const filename = exportCharacterHtml(cardRef.current, currentCharacter, theme);
    showToast(`🌐 HTML 独立角色卡导出成功: ${filename}`);
  };

  // ================= 5. Native Print =================
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* ===== 顶部控制与导出面板 ===== */}
      <div className="no-print bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-md flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* 左侧：外观风格与实时编辑 */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-xl">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 pl-2">🎨 纸张材质:</span>
            <button
              className={`btn btn-xs rounded-lg ${theme === 'parchment' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTheme('parchment')}
            >
              羊皮纸 (Parchment)
            </button>
            <button
              className={`btn btn-xs rounded-lg ${theme === 'classic' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTheme('classic')}
            >
              纯白黑墨 (Classic B&W)
            </button>
          </div>

          <button
            className={`btn btn-sm ${isEditable ? 'btn-warning' : 'btn-outline'}`}
            onClick={() => setIsEditable(!isEditable)}
          >
            {isEditable ? '🔒 完成编辑 (View)' : '✏️ 实时编辑卡牌 (Edit)'}
          </button>

          <button
            className={`btn btn-sm ${showGMSecrets ? 'btn-warning' : 'btn-ghost'}`}
            onClick={() => setShowGMSecrets(!showGMSecrets)}
            title="显示或隐藏裁判独享的先知具体属性与黑幕秘辛"
          >
            {showGMSecrets ? '👁️ 先知秘辛: 已显示 (GM)' : '🔒 先知秘辛: 已隐蔽 (玩家)'}
          </button>
        </div>

        {/* 右侧：存档与导出 */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="btn btn-sm btn-ghost cursor-pointer m-0">
            📥 导入 JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>

          <button className="btn btn-sm btn-ghost" onClick={handleExportJson}>
            💾 导出 JSON
          </button>

          <button className="btn btn-sm btn-ghost" onClick={handleExportHtml}>
            🌐 导出 HTML
          </button>

          <button
            className="btn btn-sm btn-primary shadow-sm"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
          >
            {isExportingPdf ? '⏳ 生成 PDF 中...' : '📄 导出典藏 PDF'}
          </button>

          <button className="btn btn-sm btn-warning shadow-sm" onClick={handlePrint}>
            🖨️ 打印角色卡
          </button>
        </div>
      </div>

      {/* 提示通知 Toast */}
      {toastMessage && (
        <div
          className="no-print"
          style={{
            padding: '0.6rem 1rem',
            background: 'var(--crimson-light)',
            color: 'var(--crimson-primary)',
            border: '1px solid var(--crimson-border)',
            borderRadius: 'var(--radius-sm)',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* ===== 核心：根据 PDF 样式渲染的神话堡垒骑士角色卡 ===== */}
      <MythicCharacterCard
        character={currentCharacter}
        theme={theme}
        isEditable={isEditable}
        showGMSecrets={showGMSecrets}
        onUpdate={updateCurrentCharacter}
        cardRef={cardRef}
      />
    </div>
  );
}
