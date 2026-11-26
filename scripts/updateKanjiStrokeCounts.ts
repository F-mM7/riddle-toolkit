// 漢字の画数データ(src/data/kanjiStrokeCounts.ts)を KANJIDIC2 の最新版から作り直すスクリプト
//
// 実行: npm run update:kanji-data
//   (Node 22.18 以降。TypeScript のまま node で実行する)
//
// 定期的に実行し、結果をコミットすること。
// KANJIDIC2 の利用条件(EDRDG ライセンス第4節 Updating Dictionary Versions)が、
// データを使うソフトウェアや Web サイトに、最新版から定期的に更新する手順を求めているため
// (同節は Web 上の辞書サーバーの例として「少なくとも月に1回」を挙げている)。
//   https://www.edrdg.org/edrdg/licence.html
//
// オプション(--input と --out は試験用):
//   --input <path>  ダウンロードせず、手元の kanjidic2.xml.gz を読む
//   --out <path>    出力先を変える(既定は src/data/kanjiStrokeCounts.ts)
//   --allow-shrink  字数の減少の確認(下記)を行わない。KANJIDIC2 側で収録字が
//                   実際に大きく減ったことを確かめたうえで、意図して減らすときだけ使う
//
// ダウンロードしたデータは信頼しない。内容を検証してから一時ファイルに書き、
// 置き換える。途中で失敗した場合は、既存の出力ファイルを変えずにエラーで止まる。
// 検証の内容:
//   - gzip として展開でき、UTF-8 として読めること
//   - ルート要素 kanjidic2 の閉じタグで終わること(途中で切れたデータを受け付けない)
//   - header の各項目と、各 character の literal・stroke_count の形式
//   - 字数が、出力先にある既存のデータの字数の 90% 以上であること
//     (出力先が無いときは比べずに書き出す。出力先があるのに字数を読み取れないときは止まる)

import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { gunzipSync } from 'node:zlib';
import * as prettier from 'prettier';

const SOURCE_URL = 'https://www.edrdg.org/kanjidic/kanjidic2.xml.gz';
const DEFAULT_OUT = fileURLToPath(new URL('../src/data/kanjiStrokeCounts.ts', import.meta.url));
/** ダウンロードする gzip の上限(現在は約 1.5MB) */
const MAX_GZIP_BYTES = 50 * 1024 * 1024;
/** 展開後の XML の上限(現在は約 15MB) */
const MAX_XML_BYTES = 500 * 1024 * 1024;
/** 画数として受け付ける上限 */
const MAX_STROKE_COUNT = 100;
/** 既存のデータの字数に対して、受け付ける字数の下限の割合 */
const MIN_TOTAL_RATIO = 0.9;

interface KanjidicHeader {
  fileVersion: string;
  databaseVersion: string;
  dateOfCreation: string;
}

interface ParsedKanjidic {
  header: KanjidicHeader;
  /** 画数 → その画数の漢字(KANJIDIC2 の収録順) */
  groups: Map<number, string[]>;
  total: number;
}

class DataError extends Error {}

async function loadGzip(input: string | undefined): Promise<Buffer> {
  if (input !== undefined) {
    return readFile(input);
  }
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new DataError(`ダウンロードに失敗しました: ${response.status} ${response.statusText}`);
  }
  const body = Buffer.from(await response.arrayBuffer());
  if (body.length > MAX_GZIP_BYTES) {
    throw new DataError(`ダウンロードしたファイルが大きすぎます: ${body.length} bytes`);
  }
  return body;
}

function decompress(gzip: Buffer): string {
  if (gzip.length === 0) {
    throw new DataError('入力が空です');
  }
  let xml: Buffer;
  try {
    xml = gunzipSync(gzip, { maxOutputLength: MAX_XML_BYTES });
  } catch (error) {
    throw new DataError(`gzip を展開できません: ${(error as Error).message}`);
  }
  return new TextDecoder('utf-8', { fatal: true }).decode(xml);
}

function readHeaderField(header: string, tag: string, pattern: RegExp): string {
  const match = header.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
  if (match === null) {
    throw new DataError(`header に ${tag} がありません`);
  }
  const value = match[1].trim();
  if (!pattern.test(value)) {
    throw new DataError(`header の ${tag} の形式が想定外です: ${JSON.stringify(value)}`);
  }
  return value;
}

/** KANJIDIC2 の構造(header の後に character が並ぶ)に合わせた最小限の読み取り */
function parseKanjidic(xml: string): ParsedKanjidic {
  // DTD の中のコメントや宣言を読まないよう、ルート要素の開始から後だけを見る
  const rootStart = xml.indexOf('<kanjidic2>');
  if (rootStart === -1) {
    throw new DataError('ルート要素 kanjidic2 がありません');
  }
  const body = xml.slice(rootStart).replace(/<!--[\s\S]*?-->/g, '');
  // character の切れ目でちょうど途切れたデータも、gzip としては正しく展開できてしまうため、
  // 文書の終わりまで揃っていることを閉じタグで確かめる
  if (!body.trimEnd().endsWith('</kanjidic2>')) {
    throw new DataError(
      'ルート要素 kanjidic2 の閉じタグで終わっていません(データが途中で切れています)'
    );
  }

  const headerMatch = body.match(/<header>([\s\S]*?)<\/header>/);
  if (headerMatch === null) {
    throw new DataError('header がありません');
  }
  const header: KanjidicHeader = {
    fileVersion: readHeaderField(headerMatch[1], 'file_version', /^\d+$/),
    databaseVersion: readHeaderField(headerMatch[1], 'database_version', /^\d{4}-\d+$/),
    dateOfCreation: readHeaderField(headerMatch[1], 'date_of_creation', /^\d{4}-\d{2}-\d{2}$/),
  };

  const openCount = body.match(/<character>/g)?.length ?? 0;
  const blocks = [...body.matchAll(/<character>([\s\S]*?)<\/character>/g)].map((m) => m[1]);
  if (blocks.length === 0) {
    throw new DataError('character が1件もありません');
  }
  if (blocks.length !== openCount) {
    throw new DataError(
      `character の開始タグ(${openCount}件)と閉じた要素(${blocks.length}件)の数が合いません`
    );
  }

  const groups = new Map<number, string[]>();
  const seen = new Set<string>();
  blocks.forEach((block, index) => {
    const where = `${index + 1}件目の character`;
    const literalMatch = block.match(/<literal>([^<]*)<\/literal>/);
    if (literalMatch === null) {
      throw new DataError(`${where} に literal がありません`);
    }
    const literal = literalMatch[1];
    // 漢字1字(1コードポイント)だけを受け付ける。生成するコードに引用符などが入らないことも兼ねる
    if (!/^\p{Script=Han}$/u.test(literal)) {
      throw new DataError(
        `${where} の literal が漢字1字ではありません: ${JSON.stringify(literal)}`
      );
    }
    if (seen.has(literal)) {
      throw new DataError(`literal が重複しています: ${literal}`);
    }
    seen.add(literal);

    const misc = block.match(/<misc>([\s\S]*?)<\/misc>/);
    const strokeMatch = misc?.[1].match(/<stroke_count>([^<]*)<\/stroke_count>/);
    if (strokeMatch === null || strokeMatch === undefined) {
      throw new DataError(`${literal}(${where})に stroke_count がありません`);
    }
    const strokeText = strokeMatch[1].trim();
    const strokeCount = Number(strokeText);
    if (!/^\d+$/.test(strokeText) || strokeCount < 1 || strokeCount > MAX_STROKE_COUNT) {
      throw new DataError(
        `${literal} の stroke_count が正の整数ではありません: ${JSON.stringify(strokeText)}`
      );
    }

    const group = groups.get(strokeCount);
    if (group === undefined) {
      groups.set(strokeCount, [literal]);
    } else {
      group.push(literal);
    }
  });

  return { header, groups, total: seen.size };
}

function render({ header, groups, total }: ParsedKanjidic): string {
  const lines = [
    '// 漢字の画数データ(プログラムで生成。手で編集しない)',
    '//',
    '// 出典: KANJIDIC2(Electronic Dictionary Research and Development Group, EDRDG)',
    '//   https://www.edrdg.org/wiki/index.php/KANJIDIC_Project',
    `//   database_version: ${header.databaseVersion} / file_version: ${header.fileVersion} / date_of_creation: ${header.dateOfCreation}`,
    '// 著作権: Copyright James William Breen and The Electronic Dictionary Research and Development Group',
    '// ライセンス: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
    '//   https://creativecommons.org/licenses/by-sa/4.0/',
    '//   利用条件と無保証の定め: EDRDG General Dictionary Licence Statement',
    '//   https://www.edrdg.org/edrdg/licence.html',
    '// 加工: 各字の stroke_count のうち最初の値(標準の画数)だけを取り出し、',
    '//   画数ごとに、KANJIDIC2 の収録順で漢字を連ねた文字列にした。',
    '//   加工したこのデータも CC BY-SA 4.0 で提供する',
    '// 更新: npm run update:kanji-data(scripts/updateKanjiStrokeCounts.ts)で最新版から作り直す。',
    '//   EDRDG ライセンス第4節が最新版からの定期的な更新を求めているため、定期的に実行すること',
    '',
    '/** 収録している漢字の数 */',
    `export const KANJI_STROKE_COUNT_TOTAL = ${total};`,
    '',
    '/** KANJIDIC2 の版(database_version) */',
    `export const KANJIDIC2_DATABASE_VERSION = '${header.databaseVersion}';`,
    '',
    '/** [画数, その画数の漢字を連ねた文字列] の一覧(画数の昇順) */',
    'export const STROKE_COUNT_GROUPS: readonly (readonly [number, string])[] = [',
    ...[...groups.keys()]
      .sort((a, b) => a - b)
      .map((count) => `  [${count}, '${groups.get(count)!.join('')}'],`),
    '];',
    '',
  ];
  return lines.join('\n');
}

/** 出力先にある既存のデータの字数。出力先が無ければ undefined */
async function readExistingTotal(outPath: string): Promise<number | undefined> {
  let existing: string;
  try {
    existing = await readFile(outPath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined;
    }
    throw new DataError(
      `既存の出力ファイルを読めません(字数を比べられません): ${(error as Error).message}`
    );
  }
  const match = existing.match(/export const KANJI_STROKE_COUNT_TOTAL = (\d+);/);
  if (match === null) {
    throw new DataError(
      `既存の出力ファイルから字数(KANJI_STROKE_COUNT_TOTAL)を読み取れません: ${outPath}`
    );
  }
  return Number(match[1]);
}

/** 字数が既存のデータより大きく減っていないことを確かめる */
async function checkShrink(outPath: string, total: number): Promise<void> {
  const existingTotal = await readExistingTotal(outPath);
  if (existingTotal === undefined) {
    process.stdout.write(`既存の出力ファイルが無いため、字数を比べずに書き出します: ${outPath}\n`);
    return;
  }
  if (total < existingTotal * MIN_TOTAL_RATIO) {
    throw new DataError(
      `字数が既存のデータ(${existingTotal}字)から ${total}字 に大きく減っています。` +
        '意図して減らす場合は --allow-shrink を付けて実行してください'
    );
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      input: { type: 'string' },
      out: { type: 'string' },
      'allow-shrink': { type: 'boolean', default: false },
    },
    strict: true,
  });
  const outPath = path.resolve(values.out ?? DEFAULT_OUT);

  const parsed = parseKanjidic(decompress(await loadGzip(values.input)));
  if (!values['allow-shrink']) {
    await checkShrink(outPath, parsed.total);
  }
  const source = render(parsed);
  const config = await prettier.resolveConfig(DEFAULT_OUT);
  const formatted = await prettier.format(source, { ...config, parser: 'typescript' });

  const tempPath = `${outPath}.tmp-${process.pid}`;
  try {
    await writeFile(tempPath, formatted, { encoding: 'utf-8', flag: 'wx' });
    await rename(tempPath, outPath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }

  const { header, groups, total } = parsed;
  process.stdout.write(
    [
      `書き出しました: ${outPath}`,
      `  database_version: ${header.databaseVersion} / file_version: ${header.fileVersion} / date_of_creation: ${header.dateOfCreation}`,
      `  漢字 ${total} 字、画数 ${groups.size} 種類`,
      '',
    ].join('\n')
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`中断しました(出力ファイルは変更していません): ${message}\n`);
  process.exitCode = 1;
});
