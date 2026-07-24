import fs from "fs";
import path from "path";
import Mustache from "mustache";
import * as esbuild from "esbuild";
import { buildPosts } from "./build-posts.js";

async function main() {
  const distDir = path.resolve("dist");
  const cacheFlag = path.join(distDir, ".cache");

  if (!fs.existsSync(cacheFlag)) {
    fs.rmSync(distDir, { recursive: true, force: true });
    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(cacheFlag, "");
    console.log("First load: cleared dist/");
  }

  const posts = await buildPosts(distDir);
  const visiblePosts = posts
    .filter((p) => !p.archived)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const template = fs.readFileSync(path.resolve("src/partials/index.html"), "utf-8");
  const html = Mustache.render(template, {
    copyright_year: new Date().getFullYear(),
    posts: visiblePosts,
    description: "Commercial Pilot, Software Engineer in the San Francisco Bay Area",
  });
  fs.writeFileSync(path.join(distDir, "index.html"), html);
  console.log("Built dist/index.html");

  await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    minify: true,
    outfile: "dist/index.js",
    platform: "browser",
    target: "es2022",
  });
  console.log("Built dist/index.js");

  const staticDir = path.resolve("static");
  if (fs.existsSync(staticDir)) {
    copyDir(staticDir, distDir);
    console.log("Copied static/ to dist/");
  }
}

function copyDir(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main();
