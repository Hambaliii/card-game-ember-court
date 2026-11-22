import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await cp(s, d);
  }
}

async function main(): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  const gameSrc = path.join(repoRoot, "game");
  if (existsSync(gameSrc)) await copyDir(gameSrc, path.join(outputDir, "game"));
  const shotsSrc = path.join(repoRoot, "screenshots");
  if (existsSync(shotsSrc)) await copyDir(shotsSrc, path.join(outputDir, "screenshots"));
  const dossier = await buildDossier({
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  // buildDossier returns a Uint8Array — write RAW BYTES, never stringify it.
  await writeFile(path.join(outputDir, "dossier.json"), dossier);
}

await main();
