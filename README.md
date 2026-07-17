# samwinslow-com
Statically-generated personal site with extremely minimal dependencies

## How it's structured

`src/partials` contains templates as HTML files that use Mustache template syntax. This allows us to inject and iterate over content (like the posts list) without using a heavier framework like React.

`src/posts` contains the source content of each post in MDX format (an extension of Markdown). The filename is used as the URL slug for each post. The frontmatter defines the post title, publication date, and other attributes.

`static` contains styles and images. Within posts, images are processed with Sharp to deliver optimized WEBPs. In the post body, still use the original filename, like: `![alt text](img.jpg)`. The build script will process `img.jpg` and replace this with a `<picture>` element with the processed WEBP image and the original format as a fallback.

## Developing, building, and serving

- `npm run dev`
  - Watch the src and static directories for changes, and run the build script. Serves by default on port 3000.
  - Processing images is time-consuming, so a cache is maintained so that images with the same name don't get reprocessed each time.
- `npm run build`
  - Run the esbuild and Sharp pipeline and output to `dist`.
- `npm run serve`
  - Use `serve` to serve the contents of the `dist` directory.
  - There's nothing special about the serve script; the files are entirely static and can be served just as well with nginx or a static site service like GitHub Pages.

## Extending this

The posts and image content are proprietary, but feel free to fork this source code and use everything else to build your own extremely minimal site. MIT license terms apply; no warranty.
