import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Character } from '../types';

export function exportCharacterJson(character: Character) {
  const dataStr = JSON.stringify(character, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = (character.name || 'knight').replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_');
  const filename = `${safeName}_mythic_card.json`;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return filename;
}

export function exportCharacterPdf(element: HTMLElement, characterName: string, theme: string) {
  return html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    backgroundColor: theme === 'parchment' ? '#f6f0e2' : '#ffffff',
    logging: false,
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    const width = imgWidth * ratio;
    const height = imgHeight * ratio;
    const x = (pdfWidth - width) / 2;
    const y = (pdfHeight - height) / 2;

    pdf.addImage(imgData, 'PNG', x, y, width, height);
    const safeName = (characterName || 'knight').replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_');
    const filename = `${safeName}_MythicCard.pdf`;
    pdf.save(filename);
    return filename;
  });
}

export function exportCharacterHtml(element: HTMLElement, character: Character, theme: string) {
  const bodyBg = theme === 'parchment' ? '#f6f0e2' : '#ffffff';
  const safeName = (character.name || 'knight').replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_');

  const cssStyles = `
    body { margin: 0; padding: 20px; background-color: #e5dfd3; font-family: "IM Fell English", Georgia, serif; display: flex; justify-content: center; }
    .mythic-sheet-wrapper { width: 100%; max-width: 920px; }
    .mythic-sheet { background-color: ${bodyBg}; color: #000000; width: 100%; padding: 24px 28px; border: 3px solid #000000; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15); box-sizing: border-box; }
    .mythic-border-top, .mythic-border-bottom { width: 100%; height: 18px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 8px; }
    .mythic-border-bottom { margin-top: 14px; margin-bottom: 0; }
    .mythic-border-pattern { width: 100%; height: 14px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='14' viewBox='0 0 40 14'%3E%3Cpath d='M0,7 Q10,0 20,7 Q30,14 40,7 M5,7 A2,2 0 1,1 9,7 A2,2 0 1,1 5,7 M25,7 A2,2 0 1,1 29,7 A2,2 0 1,1 25,7' stroke='%23000000' stroke-width='1.2' fill='none'/%3E%3C/svg%3E"); background-repeat: repeat-x; }
    .mythic-grid-top { display: grid; grid-template-columns: 210px 1fr 200px; gap: 16px; align-items: start; }
    .font-gothic { font-family: "UnifrakturMaguntia", "MedievalSharp", cursive, serif; }
    .mythic-field-label { font-family: "UnifrakturMaguntia", cursive; font-size: 1.35rem; text-align: center; margin-bottom: 2px; }
    .mythic-box-input { border: 1.5px solid #000; padding: 3px 6px; text-align: center; font-size: 0.95rem; min-height: 28px; display: flex; align-items: center; justify-content: center; }
    .mythic-conditions { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; }
    .mythic-condition-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 2px; font-size: 1.05rem; }
    .mythic-diamond-checkbox { width: 14px; height: 14px; border: 1.5px solid #000; transform: rotate(45deg); display: inline-block; }
    .mythic-diamond-checkbox.checked { background-color: #000; }
    .mythic-steed-box { margin-top: 12px; display: flex; flex-direction: column; gap: 4px; }
    .mythic-steed-line { display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; border-bottom: 1px solid #666; padding: 1px 0; }
    .mythic-main-title { text-align: center; margin-bottom: 8px; }
    .mythic-logo-text { font-family: "UnifrakturMaguntia", cursive; font-size: 3rem; line-height: 1; margin: 0; }
    .mythic-virtues-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; text-align: center; }
    .mythic-virtue-cell { display: flex; flex-direction: column; align-items: center; }
    .mythic-diamond-container { width: 64px; height: 64px; border: 1.5px solid #000; transform: rotate(45deg); margin: 8px 0; display: flex; align-items: center; justify-content: center; background: ${bodyBg}; }
    .mythic-diamond-content { transform: rotate(-45deg); display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; }
    .mythic-diamond-line { width: 36px; height: 1px; background-color: #000; margin: 1px 0; }
    .mythic-stat-val { font-size: 1.15rem; font-weight: bold; }
    .mythic-stat-subval { font-size: 0.75rem; color: #444; }
    .mythic-virtue-subtext { font-size: 0.75rem; font-style: italic; line-height: 1.15; text-align: center; margin-top: 2px; }
    .mythic-guard-armour-row { display: flex; align-items: center; justify-content: space-around; margin-bottom: 14px; }
    .mythic-banner-block { border: 1.5px solid #000; margin-bottom: 12px; background: ${bodyBg}; }
    .mythic-banner-header { background-color: #000000; color: #ffffff; font-family: "UnifrakturMaguntia", cursive; font-size: 1.4rem; text-align: center; padding: 2px 8px; }
    .mythic-banner-content { padding: 10px 14px; font-size: 0.92rem; line-height: 1.35; }
    .mythic-dagger-title { text-align: center; font-weight: bold; font-size: 1rem; margin: 4px 0 2px 0; }
    .mythic-arms-table, .mythic-armour-table { border: 1.5px solid #000; min-height: 70px; padding: 4px; margin-bottom: 10px; }
    .mythic-item-line { border-bottom: 1px solid #ccc; padding: 2px 4px; font-size: 0.88rem; }
    .mythic-grid-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px; }
    .mythic-gambits-feats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 14px; border-top: 1.5px solid #000; padding-top: 10px; }
    .mythic-gambit-list { list-style: none; padding-left: 0; margin: 6px 0; font-size: 0.88rem; line-height: 1.35; }
    .mythic-gambit-list li { position: relative; padding-left: 14px; margin-bottom: 3px; }
    .mythic-gambit-list li::before { content: "•"; position: absolute; left: 2px; font-weight: bold; }
    .mythic-feat-item { display: flex; margin-bottom: 10px; }
    .mythic-feat-name { font-family: "UnifrakturMaguntia", cursive; font-size: 1.5rem; width: 90px; flex-shrink: 0; }
    .mythic-feat-details { font-size: 0.84rem; line-height: 1.3; }
    @media print { body { background: #fff !important; padding: 0 !important; } .mythic-sheet { border-color: #000 !important; box-shadow: none !important; } }
  `;

  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${character.name} — Mythic Bastionland Character Sheet</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&family=MedievalSharp&family=IM+Fell+English:ital@0;1&family=Cinzel:wght@600;700;900&display=swap" rel="stylesheet">
  <style>${cssStyles}</style>
</head>
<body>
  <div class="mythic-sheet-wrapper">
    ${element.outerHTML}
  </div>
  <script type="application/json" id="mythic-character-data">
    ${JSON.stringify(character, null, 2)}
  </script>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const filename = `${safeName}_MythicCard.html`;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return filename;
}
