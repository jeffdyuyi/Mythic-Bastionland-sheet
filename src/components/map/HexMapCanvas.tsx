import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useMapStore, getHexKey } from '../../stores/useMapStore';
import type { TerrainType, StructureType } from '../../types/map';

const TERRAIN_STYLES: Record<TerrainType, { bg: string; border: string; name: string }> = {
  plains: { bg: '#E2F1E7', border: '#86EFAC', name: '平原' },
  forest: { bg: '#22543D', border: '#15803D', name: '森林' },
  mountain: { bg: '#64748B', border: '#334155', name: '山脉' },
  water: { bg: '#0284C7', border: '#0369A1', name: '水域' },
  shallow_water: { bg: '#38BDF8', border: '#0284C7', name: '浅滩' },
  deep_water: { bg: '#0C4A6E', border: '#0369A1', name: '深海' },
  swamp: { bg: '#713F12', border: '#854D0E', name: '沼泽' },
  desert: { bg: '#FACC15', border: '#CA8A04', name: '荒漠' },
  hills: { bg: '#84CC16', border: '#65A30D', name: '丘陵' },
  wasteland: { bg: '#475569', border: '#1E293B', name: '废土' },
};

export const HexMapCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    width,
    height,
    hexSize,
    hexes,
    tokens,
    mode,
    activeTool,
    selectedTerrain,
    paintHex,
    floodFillTerrain,
    selectHex,
    selectedHexKey,
    selectedTokenId,
    selectToken,
    moveToken,
  } = useMapStore();

  // 平移与缩放 Viewport State
  const [transform, setTransform] = useState({ x: 40, y: 40, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [hoveredHexKey, setHoveredHexKey] = useState<string | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // 计算 Pointy-topped 六边形的中心像素位置
  const getHexPixelPos = useCallback(
    (col: number, row: number) => {
      const hexWidth = hexSize * Math.sqrt(3);
      const x = hexWidth * (col + 0.5 * (row & 1));
      const y = hexSize * 1.5 * row;
      return { x, y };
    },
    [hexSize]
  );

  // 从画布像素坐标逆算 Col, Row
  const getHexFromPixel = useCallback(
    (px: number, py: number) => {
      // 转化为相对网格的像素
      const rawY = py / (hexSize * 1.5);
      const row = Math.round(rawY);
      const rawX = px / (hexSize * Math.sqrt(3)) - 0.5 * (row & 1);
      const col = Math.round(rawX);

      if (col >= 0 && col < width && row >= 0 && row < height) {
        return { col, row };
      }
      return null;
    },
    [hexSize, width, height]
  );

  // 绘制单格正六边形 Path
  const drawHexPath = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30); // 顶点朝上
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  // 绘制结构/建筑图标
  const drawStructureIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, struct: StructureType) => {
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 1.5;

    if (struct === 'village' || struct === 'hamlet') {
      // 房屋图形
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 4);
      ctx.lineTo(cx - 8, cy - 2);
      ctx.lineTo(cx, cy - 9);
      ctx.lineTo(cx + 8, cy - 2);
      ctx.lineTo(cx + 8, cy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (struct === 'town' || struct === 'city') {
      // 城堡/城镇墙图形
      ctx.beginPath();
      ctx.rect(cx - 10, cy - 6, 20, 12);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 6);
      ctx.lineTo(cx - 10, cy - 10);
      ctx.lineTo(cx - 5, cy - 10);
      ctx.lineTo(cx - 5, cy - 6);
      ctx.lineTo(cx, cy - 6);
      ctx.lineTo(cx, cy - 10);
      ctx.lineTo(cx + 5, cy - 10);
      ctx.lineTo(cx + 5, cy - 6);
      ctx.lineTo(cx + 10, cy - 6);
      ctx.lineTo(cx + 10, cy - 10);
      ctx.stroke();
    } else if (struct === 'castle') {
      // 王国城堡
      ctx.fillStyle = '#B45309';
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 10px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏰', cx, cy - 1);
    } else if (struct === 'ruins') {
      // 废墟
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏛️', cx, cy);
    } else if (struct === 'myth_site') {
      // 神话圣所
      ctx.fillStyle = '#BE123C';
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✨', cx, cy);
    }
    ctx.restore();
  };

  // 渲染逻辑
  const renderMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // 应用平移与缩放变换
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // 1. 绘制网格 hexes
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const key = getHexKey(c, r);
        const cell = hexes[key];
        if (!cell) continue;

        const { x: cx, y: cy } = getHexPixelPos(c, r);

        // 绘制基础底色
        const style = TERRAIN_STYLES[cell.terrain] || TERRAIN_STYLES.plains;
        drawHexPath(ctx, cx, cy, hexSize - 1);

        ctx.fillStyle = style.bg;
        ctx.fill();

        ctx.strokeStyle = style.border;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 绘制装饰细节 (平原细草、山峰、水波)
        ctx.save();
        if (cell.terrain === 'mountain') {
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy + 6);
          ctx.lineTo(cx, cy - 8);
          ctx.lineTo(cx + 8, cy + 6);
          ctx.stroke();
        } else if (cell.terrain === 'water' || cell.terrain === 'deep_water') {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(cx - 3, cy, 4, 0, Math.PI);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.restore();

        // 绘制建筑结构
        if (cell.structure && cell.structure !== 'none') {
          drawStructureIcon(ctx, cx, cy, cell.structure);
        }

        // 绘制自定义 Label
        if (cell.label) {
          ctx.save();
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#0F172A';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          // 阴影背景
          ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
          ctx.shadowBlur = 4;
          ctx.fillText(cell.label, cx, cy + 10);
          ctx.restore();
        }

        // 2. 战争迷雾渲染 (Fog of War)
        if (!cell.explored) {
          drawHexPath(ctx, cx, cy, hexSize - 0.5);
          if (mode === 'gm') {
            // GM 模式下：半透明半迷雾，方便 GM 指挥
            ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
            ctx.fill();
            ctx.strokeStyle = '#64748B';
            ctx.setLineDash([3, 3]);
            ctx.stroke();
            ctx.setLineDash([]);
          } else {
            // 玩家模式下：不透明漆黑云雾
            ctx.fillStyle = '#0F172A';
            ctx.fill();
            ctx.strokeStyle = '#1E293B';
            ctx.stroke();
          }
        }

        // 3. Hover 边框与选中高亮
        if (selectedHexKey === key) {
          drawHexPath(ctx, cx, cy, hexSize);
          ctx.strokeStyle = '#BE123C'; // 选中的深红亮圈
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (hoveredHexKey === key) {
          drawHexPath(ctx, cx, cy, hexSize);
          ctx.strokeStyle = '#B45309'; // 悬停古铜金
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // 4. 绘制 Token 标志
    tokens.forEach((token) => {
      const cell = hexes[getHexKey(token.col, token.row)];
      // 在 Player 模式下，如果所在 Hex 没探索且不是玩家 Token，隐藏
      if (mode === 'player' && cell && !cell.explored && !token.isPlayer) {
        return;
      }

      const { x: cx, y: cy } = getHexPixelPos(token.col, token.row);

      ctx.save();
      // Token 外光环
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = token.color || '#BE123C';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fill();

      if (selectedTokenId === token.id) {
        ctx.strokeStyle = '#FACC15'; // 选中 Token 黄色外框
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
      }
      ctx.stroke();

      // Token 内部符号/字首
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(token.symbol || token.name.charAt(0), cx, cy);

      // Token 下方名字
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#1E293B';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 3;
      ctx.fillText(token.name, cx, cy + 22);

      ctx.restore();
    });

    ctx.restore();
  }, [
    canvasRef,
    transform,
    width,
    height,
    hexSize,
    hexes,
    tokens,
    mode,
    selectedHexKey,
    hoveredHexKey,
    selectedTokenId,
    getHexPixelPos,
  ]);

  // 重置/防抖 Canvas Canvas Size 适应父容器
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 650;
      renderMap();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderMap]);

  useEffect(() => {
    renderMap();
  }, [renderMap]);

  // 鼠标交互事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 右键(2)、中键(1) 或按住 Shift，激活画布自由平移
    if (e.button === 1 || e.button === 2 || e.shiftKey) {
      setIsPanning(true);
      setStartPan({ x: mouseX - transform.x, y: mouseY - transform.y });
      return;
    }

    // 计算映射在 Map Canvas 里的坐标
    const canvasX = (mouseX - transform.x) / transform.scale;
    const canvasY = (mouseY - transform.y) / transform.scale;

    const hit = getHexFromPixel(canvasX, canvasY);

    if (hit) {
      const key = getHexKey(hit.col, hit.row);
      selectHex(key);

      // 检查是否点击了 Token
      const clickedToken = tokens.find((t) => t.col === hit.col && t.row === hit.row);
      if (clickedToken) {
        selectToken(clickedToken.id);
      } else if (selectedTokenId) {
        // 如果已选中 Token 且点击了空 Hex，移动 Token
        moveToken(selectedTokenId, hit.col, hit.row);
      }

      // 根据当前工具触发绘制/编辑
      if (mode === 'gm') {
        if (activeTool === 'brush' || activeTool === 'erase' || activeTool === 'fog_toggle') {
          paintHex(hit.col, hit.row);
        } else if (activeTool === 'fill') {
          floodFillTerrain(hit.col, hit.row, selectedTerrain);
        }
      } else {
        // 玩家模式：直接点击探索邻近 Hex
        if (selectedTokenId) {
          moveToken(selectedTokenId, hit.col, hit.row);
        } else {
          // 如果没选中 Token，默认移动第一个 Player Token
          const pToken = tokens.find((t) => t.isPlayer);
          if (pToken) {
            moveToken(pToken.id, hit.col, hit.row);
          }
        }
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isPanning) {
      setTransform((prev) => ({
        ...prev,
        x: mouseX - startPan.x,
        y: mouseY - startPan.y,
      }));
      return;
    }

    const canvasX = (mouseX - transform.x) / transform.scale;
    const canvasY = (mouseY - transform.y) / transform.scale;

    const hit = getHexFromPixel(canvasX, canvasY);
    if (hit) {
      const key = getHexKey(hit.col, hit.row);
      setHoveredHexKey(key);

      // 持续涂色 (Brush)
      if (isMouseDown && mode === 'gm' && activeTool === 'brush') {
        paintHex(hit.col, hit.row);
      }
    } else {
      setHoveredHexKey(null);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setIsPanning(false);
  };

  // 滚轮操控：默认滚轮直接平移地图，Ctrl/Meta+滚轮按鼠标指针缩放
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Meta + 滚轮按鼠标指针位置智能缩放
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setTransform((prev) => {
        const newScale = Math.max(0.3, Math.min(3.0, prev.scale * zoomFactor));
        const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
        const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
        return { x: newX, y: newY, scale: newScale };
      });
    } else {
      // 普通滚轮 -> 顺畅平移地图 (垂直与水平)
      setTransform((prev) => ({
        ...prev,
        x: prev.x - e.deltaX * 0.85,
        y: prev.y - e.deltaY * 0.85,
      }));
    }
  };

  return (
    <div className="relative w-full h-[640px] bg-stone-100 dark:bg-stone-900 rounded-3xl overflow-hidden shadow-inner border border-stone-200 dark:border-stone-800">
      <canvas
        ref={canvasRef}
        className={`w-full h-full touch-none ${isPanning ? 'cursor-grabbing' : 'cursor-crosshair'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* 画布角落快捷控制浮层 */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-600 dark:text-stone-300">
        <span>滚轮平移 | Ctrl+滚轮缩放</span>
        <span className="w-px h-3 bg-stone-300 dark:bg-stone-600" />
        <span>右键/中键/Shift 拖拽</span>
        <span className="w-px h-3 bg-stone-300 dark:bg-stone-600" />
        <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{Math.round(transform.scale * 100)}%</span>
        <button
          onClick={() => setTransform({ x: 40, y: 40, scale: 1 })}
          className="ml-1 px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-full transition cursor-pointer"
        >
          重置
        </button>
      </div>

      {/* 底部模式与提示状态条 */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow border border-stone-200/80 dark:border-stone-800/80 text-xs text-stone-700 dark:text-stone-300">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              mode === 'gm' ? 'bg-amber-600 animate-pulse' : 'bg-emerald-600'
            }`}
          />
          <span className="font-semibold">
            {mode === 'gm' ? '👑 GM 裁判模式 (完整地图编辑与视界管理)' : '🛡️ 玩家探索模式 (战争迷雾视角)'}
          </span>
        </div>
        <div>
          {hoveredHexKey && hexes[hoveredHexKey] ? (
            <span>
              位置 [{hexes[hoveredHexKey].col}, {hexes[hoveredHexKey].row}] ·{' '}
              {TERRAIN_STYLES[hexes[hoveredHexKey].terrain]?.name || '平原'}
              {hexes[hoveredHexKey].label ? ` · ${hexes[hoveredHexKey].label}` : ''}
              {!hexes[hoveredHexKey].explored ? ' (迷雾中)' : ''}
            </span>
          ) : (
            <span>点击六边形进行移动或绘制</span>
          )}
        </div>
      </div>
    </div>
  );
};
