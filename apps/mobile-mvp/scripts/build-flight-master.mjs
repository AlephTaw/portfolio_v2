// Assemble a pixel-exact endpoint master and a browser-compatible preview.
// Usage: node scripts/build-flight-master.mjs /absolute/path/to/runway-flight.mp4 [start.png end.png output-stem]
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const appDir = fileURLToPath(new URL("../", import.meta.url));
const input = process.argv[2];
if (!input || !path.isAbsolute(input)) throw new Error("Supply the generated video's absolute path.");
const start = process.argv[3] || path.join(appDir, "public/landing-desert-planet-v3.png");
const end = process.argv[4] || path.join(appDir, "public/landing-desert-city-v1.png");
const stem = process.argv[5] || "landing-planet-to-city-flight-v1";
if (!/^[a-z0-9-]+$/.test(stem)) throw new Error("Invalid output stem.");
const master = path.join(appDir, `assets/${stem}-exact.mkv`);
const preview = path.join(appDir, `public/${stem}.mp4`);
for (const output of [master, preview]) {
  if (existsSync(output)) throw new Error(`Refusing to overwrite ${output}`);
}

function run(command, args) {
  const result = spawnSync(command, args, { maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString());
  return result.stdout;
}
function probe(file) {
  return JSON.parse(run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=width,height,avg_frame_rate,nb_read_frames:format=duration", "-of", "json", file]));
}
const source = probe(input);
const stream = source.streams[0];
const sourceCount = Number(stream.nb_read_frames);
const [numerator, denominator] = stream.avg_frame_rate.split("/").map(Number);
const fps = numerator / denominator;
if (!Number.isFinite(fps) || fps <= 0 || !Number.isInteger(sourceCount) || sourceCount < 3) {
  throw new Error("Invalid source video frame metadata.");
}
// Some generators include an extra terminal frame; keep this delivery at 5s.
const count = Math.min(sourceCount, Math.round(5 * fps));
const dimensions = probe(start).streams[0];
const endDimensions = probe(end).streams[0];
if (dimensions.width !== endDimensions.width || dimensions.height !== endDimensions.height) {
  throw new Error("Endpoint dimensions must match.");
}
const { width, height } = dimensions;
const timing = `setsar=1,settb=AVTB,setpts=N/(${fps}*TB)`;
const filter = [
  `[1:v]format=bgr0,${timing}[start]`,
  `[0:v]trim=start_frame=1:end_frame=${count - 1},scale=${width}:${height}:flags=lanczos,format=bgr0,${timing}[flight]`,
  `[2:v]format=bgr0,${timing}[end]`,
  "[start][flight][end]concat=n=3:v=1:a=0[out]",
].join(";");
run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-n", "-i", input, "-framerate", String(fps), "-i", start, "-framerate", String(fps), "-i", end,
  "-filter_complex", filter, "-map", "[out]", "-an", "-r", String(fps), "-frames:v", String(count), "-c:v", "ffv1", "-level", "3", "-pix_fmt", "bgr0", master]);

function pixelHash(file, frame = 0) {
  const pixels = run("ffmpeg", ["-v", "error", "-i", file, "-vf", `select=eq(n\\,${frame})`, "-frames:v", "1", "-pix_fmt", "rgb24", "-f", "rawvideo", "pipe:1"]);
  if (pixels.length !== width * height * 3) throw new Error("Unexpected decoded frame size.");
  return createHash("sha256").update(pixels).digest("hex");
}
const output = probe(master);
if (Number(output.streams[0].nb_read_frames) !== count) throw new Error("Master frame count changed.");
const first = pixelHash(start), last = pixelHash(end);
if (first !== pixelHash(master) || last !== pixelHash(master, count - 1)) {
  throw new Error("Endpoint pixel verification failed.");
}
run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-n", "-i", master, "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-movflags", "+faststart", preview]);
console.log(JSON.stringify({ master, preview, width, height, fps, frames: count, duration: Number(output.format.duration), endpointsPixelIdentical: true, firstFrameRgbSha256: first, lastFrameRgbSha256: last }, null, 2));
