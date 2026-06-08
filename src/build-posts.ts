import fs from "fs";
import path from "path";
import Mustache from "mustache";
import matter from "gray-matter";
import { marked } from "marked";

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

function rewriteImagePaths(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, src) => `![${alt}](${toImgPath(src)})`
  );
}

export function buildPosts(distDir: string): PostEntry[] {
  const postsDir = path.resolve("src/posts");
  if (!fs.existsSync(postsDir)) return [];

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));
  const template = fs.readFileSync(
    path.resolve("src/partials/post.html"),
    "utf-8"
  );

  const entries: PostEntry[] = [];

  for (const file of files) {
    const slug = path.basename(file, ".mdx");
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const { data, content } = matter(raw);
    const frontmatter = data as PostFrontmatter;

    if (frontmatter.image) {
      frontmatter.image = toImgPath(frontmatter.image);
    }

    const outDir = path.join(distDir, "post", slug);
    fs.mkdirSync(outDir, { recursive: true });

    const html = Mustache.render(template, {
      ...frontmatter,
      body: marked(rewriteImagePaths(content)) as string,
      copyright_year: new Date().getFullYear(),
    });

    fs.writeFileSync(path.join(outDir, "index.html"), html);
    console.log(`Built dist/post/${slug}/index.html`);

    entries.push({ slug, ...frontmatter });
  }

  return entries;
}
