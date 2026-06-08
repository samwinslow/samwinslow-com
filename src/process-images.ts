import fs from "fs";
import path from "path";
import sharp from "sharp";

const MAX_WIDTH = 1600;

export interface ProcessedImage {
  imgSrc: string;  // e.g. /img/foo.jpg
  webpSrc: string; // e.g. /img/foo.webp
  width: number;   // actual output width
}

export async function processImage(
  srcPath: string,
  imgOutDir: string
): Promise<ProcessedImage | null> {
  if (!fs.existsSync(srcPath)) return null;

  fs.mkdirSync(imgOutDir, { recursive: true });

  const ext = path.extname(srcPath).toLowerCase();
  const base = path.basename(srcPath, ext);
  const originalFilename = path.basename(srcPath);
  const webpFilename = `${base}.webp`;
  const outOriginal = path.join(imgOutDir, originalFilename);
  const outWebp = path.join(imgOutDir, webpFilename);

  if (fs.existsSync(outOriginal) && fs.existsSync(outWebp)) {
    const { width } = await sharp(outWebp).metadata();
    console.log(`  img: ${originalFilename} (cached)`);
    return {
      imgSrc: `/img/${originalFilename}`,
      webpSrc: `/img/${webpFilename}`,
      width: width ?? MAX_WIDTH,
    };
  }

  const image = sharp(srcPath);
  const { width: origWidth } = await image.metadata();
  const outWidth = Math.min(origWidth ?? MAX_WIDTH, MAX_WIDTH);

  await sharp(srcPath)
    .resize(outWidth, undefined, { withoutEnlargement: true })
    .toFile(path.join(imgOutDir, originalFilename));

  await sharp(srcPath)
    .resize(outWidth, undefined, { withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(path.join(imgOutDir, webpFilename));

  console.log(`  img: ${originalFilename} → webp @ ${outWidth}w`);
  return {
    imgSrc: `/img/${originalFilename}`,
    webpSrc: `/img/${webpFilename}`,
    width: outWidth,
  };
}
