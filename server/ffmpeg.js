import { spawn } from 'child_process';
import { HLS_OUT_DIR, HLS_SEGMENT_TIME } from './config.js';
import fs from 'fs';
import path from 'path';

export function cleanHlsOutput() {
  if (!fs.existsSync(HLS_OUT_DIR)) fs.mkdirSync(HLS_OUT_DIR, { recursive: true });
  for (const f of fs.readdirSync(HLS_OUT_DIR)) {
    fs.unlinkSync(path.join(HLS_OUT_DIR, f));
  }
}

export function startRemuxToHls(inputUrl, opts = {}) {
  const args = [
    '-y',
    '-i', inputUrl,
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-f', 'hls',
    '-hls_time', String(opts.segmentTime || HLS_SEGMENT_TIME),
    '-hls_playlist_type', 'event',
    '-hls_flags', 'delete_segments+program_date_time',
    path.join(HLS_OUT_DIR, 'playlist.m3u8')
  ];

  const ff = spawn('ffmpeg', args, { stdio: 'inherit' });
  ff.on('exit', code => console.log('FFmpeg exited with code', code));
  return ff;
}