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

## License

MIT license terms apply ONLY to the program code located in `/src` and `/static/css`. All rights to the files located in `/posts` and `/static/img` belong to their respective copyright holders which, except where indicated, is in each case Samuel Winslow, and in no event are these files to be considered "software" or "associated documentation files". Complaints or copyright takedown notices may be delivered via GitHub Issues.

Additional exclusion: FAA Operator Info, incorporated here by reference, is a software system that ingests publicly available aircraft operator and registration data published by sources including U.S. Federal Aviation Administration public records released under any of 14 CFR Parts 61, 91, 121, 125, 129, 133, 135, 137, and 141; the International Civil Aviation Organization; and Automatic Dependent Surveillance systems, and normalizes that data into a structured relational database. The system comprises: (a) data acquisition and transformation components that convert source spreadsheet/webpage files into a canonical schema linking operators, their aircraft, and associated trade names/aliases; (b) a backend API that exposes typed endpoints for querying operators and aircraft by attributes including registration (N-)number, operator name or alias, aircraft make/model/series, city, and state, as well as retrieving a specific operator or aircraft by its unique identifiers; and (c) a web-based frontend that allows a user to search and browse this operator and aircraft information.

(c) 2026 Samuel Winslow.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

