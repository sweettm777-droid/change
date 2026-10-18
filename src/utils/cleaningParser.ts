import { CleaningArea, CleaningDutySubItem } from '../types';

/**
 * Parses user-entered free text into CleaningArea objects.
 * Supports lines like:
 * "교실 쓸기 / 교실 앞 / 1명"
 * "교실 쓸기 / 교실 가운데 / 2"
 * "복도, 쓸기, 1"
 * "분리수거 | 쓰레기통 비우기 | 2"
 * "교실 닦기 : 뒤쪽 (1명)"
 */
export function parseCleaningAreasText(text: string): CleaningArea[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const categoryMap = new Map<string, { id: string; category: string; subItems: CleaningDutySubItem[] }>();

  let idCounter = Date.now();

  for (const line of lines) {
    // Ignore comment lines
    if (line.startsWith('#') || line.startsWith('//')) continue;

    let parts: string[] = [];
    if (line.includes('/')) {
      parts = line.split('/').map((p) => p.trim());
    } else if (line.includes('|')) {
      parts = line.split('|').map((p) => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map((p) => p.trim());
    } else if (line.includes(',')) {
      parts = line.split(',').map((p) => p.trim());
    } else {
      parts = [line];
    }

    let category = '';
    let subTitle = '';
    let count = 1;

    if (parts.length >= 3) {
      category = parts[0];
      subTitle = parts[1];
      const parsedCount = parseInt(parts[2].replace(/[^0-9]/g, ''), 10);
      count = isNaN(parsedCount) || parsedCount < 1 ? 1 : parsedCount;
    } else if (parts.length === 2) {
      category = parts[0];
      // Check if parts[1] contains a count like "교실뒤 (2명)" or "교실뒤 2"
      const match = parts[1].match(/(.*?)(?:[（(](\d+)[명\s]*[)）]|[\s]+(\d+)명?)$/);
      if (match) {
        subTitle = match[1].trim();
        const num = parseInt(match[2] || match[3], 10);
        count = isNaN(num) || num < 1 ? 1 : num;
      } else {
        subTitle = parts[1];
        count = 1;
      }
    } else {
      category = parts[0];
      subTitle = parts[0];
      count = 1;
    }

    if (!category) continue;
    if (!subTitle) subTitle = category;

    const catKey = category.toLowerCase();
    if (!categoryMap.has(catKey)) {
      categoryMap.set(catKey, {
        id: `area-${idCounter++}`,
        category,
        subItems: [],
      });
    }

    const catObj = categoryMap.get(catKey)!;
    catObj.subItems.push({
      id: `sub-${idCounter++}`,
      title: subTitle,
      count,
      fixedStudents: [],
      assignedStudents: [],
    });
  }

  return Array.from(categoryMap.values());
}

/**
 * Converts existing CleaningArea array into an editable text string.
 */
export function stringifyCleaningAreas(areas: CleaningArea[]): string {
  const lines: string[] = [];
  for (const area of areas) {
    const cat = area.category.replace(/\n/g, ' ').trim();
    for (const sub of area.subItems) {
      const title = sub.title.replace(/\n/g, ' ').trim();
      lines.push(`${cat} / ${title} / ${sub.count}명`);
    }
  }
  return lines.join('\n');
}

/**
 * Presets for common Korean school cleaning layouts
 */
export const CLEANING_PRESETS = [
  {
    id: 'standard-full',
    title: '종합 표준형 (24명)',
    desc: '교실 쓸기/닦기, 칠판, 손걸레, 복도, 분리수거, 특별구역',
    text: `교실 쓸기 / 교실 앞 / 1명
교실 쓸기 / 교실 가운데 / 2명
교실 쓸기 / 교실 뒤 / 1명
교실 닦기 / 교실 앞 / 1명
교실 닦기 / 교실 뒤 / 1명
칠판 정리 / 칠판 닦고, 걸레 빨기 / 2명
손걸레 / 사물함, 창틀 닦고 걸레 빨기 / 2명
복도 / 쓸기 / 1명
복도 / 닦기 / 1명
분리수거 / 종이 및 일반쓰레기 정리 / 1명
특별구역 / 계단 및 음수대 청소 / 4명
특별구역(화목) / 분리수거장 / 2명`,
  },
  {
    id: 'classroom-focused',
    title: '교실 집중형 (12명)',
    desc: '교실 내부 및 쓰레기 분리수거 위주',
    text: `교실 쓸기 / 앞쪽 및 분단 사이 / 2명
교실 쓸기 / 뒤쪽 및 사물함 앞 / 2명
교실 닦기 / 앞쪽 및 복도쪽 바닥 / 1명
교실 닦기 / 뒤쪽 및 창가쪽 바닥 / 1명
칠판 / 칠판 지우개 털기 및 칠판 닦기 / 2명
창문 및 사물함 / 창틀 먼지 털기 및 사물함 위 닦기 / 2명
분리수거 / 교실 쓰레기통 비우기 및 분리수거 / 2명`,
  },
  {
    id: 'one-to-one',
    title: '1인 1역할 분담형 (20명)',
    desc: '학생 1인당 1개 구역을 명확히 맡는 형태',
    text: `쓸기 / 1분단 쓸기 / 1명
쓸기 / 2분단 쓸기 / 1명
쓸기 / 3분단 쓸기 / 1명
쓸기 / 4분단 쓸기 / 1명
쓸기 / 교탁 앞 쓸기 / 1명
쓸기 / 사물함 앞 쓸기 / 1명
닦기 / 1-2분단 밀대 닦기 / 1명
닦기 / 3-4분단 밀대 닦기 / 1명
칠판 / 칠판 닦기 / 1명
칠판 / 지우개 털기 및 분필 정리 / 1명
손걸레 / 교탁 및 TV 닦기 / 1명
손걸레 / 창틀 닦기 / 1명
손걸레 / 사물함 위 닦기 / 1명
복도 / 교실 앞 복도 쓸기 / 1명
복도 / 교실 앞 복도 닦기 / 1명
분리수거 / 종이 분리수거 / 1명
분리수거 / 비닐·플라스틱 분리수거 / 1명
분리수거 / 일반쓰레기 배출 / 1명
환기·소독 / 창문 환기 및 책상 소독 / 1명
청소도구함 / 청소도구 가지런히 정리 / 1명`,
  },
  {
    id: 'simple-compact',
    title: '초간편형 (8명)',
    desc: '소규모 학급이나 필수 구역 위주',
    text: `교실 바닥 / 교실 쓸기 / 2명
교실 바닥 / 교실 밀대 닦기 / 2명
칠판 및 교탁 / 칠판 및 교탁 정리 / 2명
쓰레기 분리수거 / 분리수거 및 환기 / 2명`,
  },
];
