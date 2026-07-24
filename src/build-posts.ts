import fs from "fs";
import path from "path";
import Mustache from "mustache";
import matter from "gray-matter";
import { Marked } from "marked";
import { processImage, type ProcessedImage } from "./process-images.js";

const SITE_URL = "https://samwinslow.com";

export interface PostFrontmatter {
  date: string;
  title: string;
  category: string;
  tags?: string[];
  copy?: string;
  image?: string;
  archived?: boolean;
}

export interface PostEntry extends PostFrontmatter {
  slug: string;
}

function toImgPath(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  return `/img/${src.replace(/^\.\//, "")}`;
}

function isRelative(src: string): boolean {
  return !src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("/");
}

function normalizeFilename(src: string): string {
  return src.replace(/^\.\//, "");
}

function extractImageSrcs(content: string): string[] {
  const srcs: string[] = [];
  const re = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    srcs.push(match[1]);
  }
  return srcs;
}

function picture(img: ProcessedImage, alt: string, title: string | null): string {
  const titleAttr = title ? ` title="${title}"` : "";
  return (
    `<picture>` +
    `<source type="image/webp" srcset="${img.webpSrc} ${img.width}w">` +
    `<img src="${img.imgSrc}" alt="${alt}"${titleAttr} loading="lazy">` +
    `</picture>`
  );
}

export async function buildPosts(distDir: string): Promise<PostEntry[]> {
  const postsDir = path.resolve("src/posts");
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));
  const template = fs.readFileSync(path.resolve("src/partials/post.html"), "utf-8");
  const imgOutDir = path.join(distDir, "img");

  const entries: PostEntry[] = [];

  for (const file of files) {
    const slug = path.basename(file, ".mdx");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = data as PostFrontmatter;

    // Collect all relative image references from body + frontmatter
    const imgSrcs = extractImageSrcs(content);
    if (frontmatter.image) imgSrcs.push(frontmatter.image);

    // Process each unique relative image
    const staticImgDir = path.resolve("static", "img");
    const processed = new Map<string, ProcessedImage>();
    for (const src of imgSrcs) {
      if (!isRelative(src)) continue;
      const filename = normalizeFilename(src);
      if (processed.has(filename)) continue;
      const result = await processImage(path.join(staticImgDir, filename), imgOutDir);
      if (result) processed.set(filename, result);
    }

    // Rewrite frontmatter image to webp src
    if (frontmatter.image && isRelative(frontmatter.image)) {
      const filename = normalizeFilename(frontmatter.image);
      const result = processed.get(filename);
      frontmatter.image = result ? result.webpSrc : toImgPath(frontmatter.image);
    }

    // Custom renderer: emit <picture> for local images, plain <img> for external
    const customMarked = new Marked({
      renderer: {
        image({ href, title, text }) {
          if (!isRelative(href)) {
            return `<img src="${href}" alt="${text}"${title ? ` title="${title}"` : ""}>`;
          }
          const filename = normalizeFilename(href);
          const result = processed.get(filename);
          return result
            ? picture(result, text, title)
            : `<img src="${toImgPath(href)}" alt="${text}"${title ? ` title="${title}"` : ""}>`;
        },
      },
    });

    const outDir = path.join(distDir, "post", slug);
    fs.mkdirSync(outDir, { recursive: true });

    const html = Mustache.render(template, {
      ...frontmatter,
      body: customMarked.parse(content) as string,
      copyright_year: new Date().getFullYear(),
      url: `${SITE_URL}/post/${slug}`,
      image_url: frontmatter.image ? `${SITE_URL}${frontmatter.image}` : undefined,
    });

    fs.writeFileSync(path.join(outDir, "index.html"), html);
    console.log(`Built dist/post/${slug}/index.html`);

    entries.push({ slug, ...frontmatter });
  }

  return entries;
}
