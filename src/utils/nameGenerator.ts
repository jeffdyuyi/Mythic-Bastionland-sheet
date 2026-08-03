import { rollDie } from '../data/gameTables';

export const KNIGHT_TITLES = [
  '爵士', '无畏者', '高洁者', '破晓者', '铁壁骑士', 
  '荒野守护者', '圣环骑士', '残阳骑士', '孤胆骑士', 
  '银光骑士', '凛冬骑士', '风暴骑士', '不屈者', '忠勇者', 
  '誓言守护者', '真理之剑', '荣耀者', '避难所领主'
];

export const KNIGHT_GIVEN_NAMES = [
  '罗兰', '埃尔温', '加拉哈德', '高文', '奥德里奇', 
  '珀西瓦尔', '崔斯坦', '贝迪威尔', '埃克托', '杰兰特', 
  '加雷斯', '亚瑟', '瓦利安特', '罗德里克', '戈弗雷', 
  '鲍德温', '康拉德', '雷诺', '杰弗里', '伯特兰', 
  '阿斯托尔福', '伊万', '凯因', '布兰登', '瓦伦丁', '塞德里克'
];

export const KNIGHT_SURNAME_EPITHETS = [
  '德·加尔', '德·潘德拉贡', '德·瓦洛伊斯', '德·艾尔隆', 
  '德·蒙特福特', '德·阿瓦隆', '德·海峡', '德·寒霜', 
  '德·高地', '德·黑石', '德·银堡', '德·迷雾', '德·铁山'
];

export function generateRandomKnightName(): string {
  const name = KNIGHT_GIVEN_NAMES[Math.floor(Math.random() * KNIGHT_GIVEN_NAMES.length)];
  const mode = rollDie(3);
  if (mode === 1) {
    const title = KNIGHT_TITLES[Math.floor(Math.random() * KNIGHT_TITLES.length)];
    return `${title} ${name}`;
  } else if (mode === 2) {
    const surname = KNIGHT_SURNAME_EPITHETS[Math.floor(Math.random() * KNIGHT_SURNAME_EPITHETS.length)];
    return `${name} ${surname}`;
  } else {
    const title = KNIGHT_TITLES[Math.floor(Math.random() * KNIGHT_TITLES.length)];
    const surname = KNIGHT_SURNAME_EPITHETS[Math.floor(Math.random() * KNIGHT_SURNAME_EPITHETS.length)];
    return `${title} ${name} ${surname}`;
  }
}
