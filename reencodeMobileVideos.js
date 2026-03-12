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
    // -g 1: Keyframe every frame (All-Intra)
    // -vf scale=720:-2: Safe scaling (ensures even dimensions)
    // -bf 0: No B-frames for faster seeking
    // -pix_fmt yuv420p: Best compatibility for mobile browsers
    const command = `ffmpeg -i "${inputPath}" -vf "scale=720:-2" -g 1 -bf 0 -c:v libx264 -crf 20 -pix_fmt yuv420p -tune fastdecode -an -y "${outputPath}"`;
    
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    console.log(`Finished: ${video}`);
  } catch (error) {
    console.error(`Error processing ${video}:`, error.message);
  }
});

console.log('All mobile videos re-encoded for smooth scrubbing.');
