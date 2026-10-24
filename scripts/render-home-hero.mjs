// Run with node scripts/render-home-hero.mjs (requires ffmpeg on PATH).
// Keep the original hero and Mira film as sources; only the home montage is rendered.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const home = 'public/video/hero-1080.mp4';
const mira = 'public/video/mira-film-1080.mp4';
const dissolve = 0.4;
// Source in/out points stay inside individual shots, excluding baked-in cuts,
// speed ramps and the original film's opening/closing fades. The optional speed
// gives the short Mira interiors room to breathe without including adjacent cuts.
const shots = [
  [home, 0.8, 3.4], // Original coast, continuing from the loop's closing frame.
  [home, 5.2, 2.4], // Original house exterior.
  [mira, 6.9, 3], // Mira beachfront architecture, before the cut at 10.12s.
  [home, 8.6, 2.3], // Original bright living / dining room.
  [mira, 34.72, 2.4, 0.8], // Continuous kitchen view; ends before the 37.2s rapid cuts.
  [home, 12, 2.3], // Original poolside double-height lounge.
  [mira, 39.04, 1.92, 0.8], // Continuous living area; ends before the 41s cut.
  [mira, 72.4, 4], // Mira and its beachfront setting.
  [home, 15.6, 3.7], // Original waterfront aerial, before its closing fade.
  [home, 0.4, dissolve], // Return to the coast without the original opening fade.
];

for (const [height, crf] of [[1080, 24], [720, 26]]) {
  const width = height * 16 / 9;
  const inputs = shots.flatMap(([file, start, duration]) => [
    '-ss', String(start), '-t', String(duration), '-i', file,
  ]);
  const filters = shots.map(([, , , speed = 1], i) =>
    `[${i}:v]setpts=(PTS-STARTPTS)/${speed},fps=30,scale=${width}:${height}:flags=lanczos,setsar=1,format=yuv420p,settb=AVTB[v${i}]`,
  );
  let duration = shots[0][2];
  let previous = 'v0';
  for (let i = 1; i < shots.length; i++) {
    const output = `mix${i}`;
    filters.push(`[${previous}][v${i}]xfade=transition=fade:duration=${dissolve}:offset=${(duration - dissolve).toFixed(3)}[${output}]`);
    duration += shots[i][2] / (shots[i][3] ?? 1) - dissolve;
    previous = output;
  }
  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'warning', '-y', '-filter_complex_threads', '2',
    ...inputs, '-filter_complex', filters.join(';'), '-map', `[${previous}]`,
    '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf),
    '-maxrate', height === 1080 ? '2600k' : '1200k',
    '-bufsize', height === 1080 ? '5200k' : '2400k',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-threads', '4',
    `public/video/hero-mira-${height}.mp4`,
  ], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(`Rendered ${height}p home hero (${duration.toFixed(1)}s).`);
}
