import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directories = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5', 'scene6'];
const baseDir = path.join(__dirname, 'public', 'assets', 'frames');
const frameStep = 6;

async function processFrames() {
  for (const dir of directories) {
    const scenePath = path.join(baseDir, dir);
    const mobilePath = path.join(scenePath, 'mobile');

    // Remove old mobile directory to clear out previous frames
    if (fs.existsSync(mobilePath)) {
      fs.rmSync(mobilePath, { recursive: true, force: true });
    }
    fs.mkdirSync(mobilePath, { recursive: true });

    const files = fs.readdirSync(scenePath).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
    
    // Sort files to ensure correct order
    files.sort();

    console.log(`Processing ${dir}...`);

    for (let i = 0; i < files.length; i += frameStep) {
      const file = files[i];
      const inputPath = path.join(scenePath, file);
      const outputFile = file.replace(/\.(jpg|jpeg|png)$/, '.webp');
      const outputPath = path.join(mobilePath, outputFile);

      try {
        await sharp(inputPath)
          .resize(600) // Downscale to 600px width for mobile
          .webp({ quality: 60 }) // High compression WebP
          .toFile(outputPath);
          
        console.log(`  -> Created ${outputPath}`);
      } catch (err) {
        console.error(`Error processing ${inputPath}:`, err);
      }
    }
  }
  console.log("Finished generating mobile frames.");
}

processFrames();
