import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videos = [
  '1-Exterior.mp4',
  '2-Entering.mp4',
  '3-Coffee_blending.mp4',
  '4-Espresso_pour.mp4',
  '5-Mixing_sugar.mp4',
  '6-Drinking.mp4'
];

const inputDir = path.join(__dirname, 'public', 'assets', 'videos');
const outputDir = path.join(inputDir, 'mobile');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

videos.forEach((video) => {
  const inputPath = path.join(inputDir, video);
  const outputPath = path.join(outputDir, video);

  console.log(`Processing: ${video}...`);
  
  try {
    // -g 1: Keyframe every frame
    // -vf scale=720:-1: Downscale to 720p width for mobile speed
    // -bf 0: No B-frames for faster seeking
    // -tune fastdecode: Optimize for playback/seek speed
    // -crf 20: High quality (All-Intra needs more bitrate, so lower CRF is better)
    const command = `ffmpeg -i "${inputPath}" -vf "scale=720:-1" -g 1 -bf 0 -c:v libx264 -crf 20 -tune fastdecode -an -y "${outputPath}"`;
    
    execSync(command, { stdio: 'inherit' });
    console.log(`Finished: ${video}`);
  } catch (error) {
    console.error(`Error processing ${video}:`, error.message);
  }
});

console.log('All mobile videos re-encoded for smooth scrubbing.');
