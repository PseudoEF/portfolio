import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
let checkCount = 0;

const check = (condition, message) => {
  checkCount += 1;
  if (!condition) errors.push(message);
};

const read = (file) => readFileSync(join(root, file), "utf8");

const requiredFiles = [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "assets/css/styles.css",
  "assets/js/main.js",
  "assets/favicon.svg",
  "assets/og-image.png",
  "docs/screenshots/.gitkeep",
  "docs/adr/0001-static-portfolio-on-homelab.md",
  "README.md",
  "LICENSE",
  ".editorconfig",
  ".gitignore",
  ".github/workflows/ci.yml",
];

requiredFiles.forEach((file) => {
  check(existsSync(join(root, file)), `missing required file: ${file}`);
});

const htmlFiles = readdirSync(root)
  .filter((file) => extname(file) === ".html")
  .sort();

check(htmlFiles.includes("index.html"), "index.html must exist at the repository root");
check(htmlFiles.includes("404.html"), "404.html must exist at the repository root");

const index = read("index.html");
const notFound = read("404.html");
const styles = read("assets/css/styles.css");
const script = read("assets/js/main.js");
const sitemap = read("sitemap.xml");
const robots = read("robots.txt");
const license = read("LICENSE");

const hasMeta = (html, attribute, value) => {
  const pattern = new RegExp(`<meta\\s+[^>]*${attribute}="${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "i");
  return pattern.test(html);
};

check(/^<!doctype html>/i.test(index), "index.html must start with <!doctype html>");
check(/<html\s+lang="ru"/i.test(index), "index.html must declare lang=\"ru\"");
check(/<html\s+lang="ru"/i.test(notFound), "404.html must declare lang=\"ru\"");
check(/<title>[^<]+<\/title>/i.test(index), "index.html must have a non-empty title");
check(/<title>[^<]+<\/title>/i.test(notFound), "404.html must have a non-empty title");
check(hasMeta(index, "name", "description"), "index.html must have a meta description");
check(hasMeta(index, "name", "viewport"), "index.html must have a viewport meta tag");
check(hasMeta(index, "name", "robots"), "index.html must have a robots meta tag");
check(hasMeta(notFound, "name", "robots"), "404.html must have a robots meta tag");
check(/<meta\s+name="robots"\s+content="noindex/i.test(notFound), "404.html must be noindex");
check(!/<meta\s+name="robots"\s+content="noindex/i.test(index), "index.html must be indexable");
check(/<link\s+rel="canonical"\s+href="https:\/\/pseudoef\.pp\.ua\/"/i.test(index), "index.html canonical must be the apex URL");
check(/<link\s+rel="icon"\s+href="\/assets\/favicon\.svg"/i.test(index), "index.html must use the local favicon");
check(/<link\s+rel="stylesheet"\s+href="\/assets\/css\/styles\.css"/i.test(index), "index.html must load the local stylesheet");
check(/<script\s+src="\/assets\/js\/main\.js"\s+defer><\/script>/i.test(index), "index.html must load the local deferred script");
check(/<link\s+rel="stylesheet"\s+href="\/assets\/css\/styles\.css"/i.test(notFound), "404.html must load the local stylesheet");
check(/<script\s+src="\/assets\/js\/main\.js"\s+defer><\/script>/i.test(notFound), "404.html must load the local deferred script");

const requiredMeta = [
  ["property", "og:type"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:url"],
  ["property", "og:image"],
  ["property", "og:image:alt"],
  ["name", "twitter:card"],
  ["name", "twitter:title"],
  ["name", "twitter:description"],
  ["name", "twitter:image"],
];

requiredMeta.forEach(([attribute, value]) => {
  check(hasMeta(index, attribute, value), `index.html missing meta ${attribute}="${value}"`);
});

check(
  /<meta\s+property="og:url"\s+content="https:\/\/pseudoef\.pp\.ua\/"/i.test(index),
  "og:url must be the apex URL"
);
check(
  /<meta\s+property="og:image"\s+content="https:\/\/pseudoef\.pp\.ua\/assets\/og-image\.png"/i.test(index),
  "og:image must point at the local social image"
);

const requiredIds = [
  "main",
  "top",
  "projects",
  "case-study",
  "stack",
  "practices",
  "contact",
  "project-gordaya",
  "project-homelab",
  "project-crm",
  "project-sim",
  "project-wireguard",
];

requiredIds.forEach((id) => {
  check(new RegExp(`\\bid="${id}"`).test(index), `index.html missing required id: ${id}`);
});

const requiredText = [
  "Доступен для проектов",
  "Full-stack разработка и self-hosted инфраструктура",
  "сделано и захостено на собственном сервере",
];

requiredText.forEach((text) => {
  check(index.includes(text), `index.html missing required text: ${text}`);
});

const requiredLinks = [
  "https://gordaya.pp.ua/",
  "https://panel.pseudoef.pp.ua/",
  "https://crm.pseudoef.pp.ua/",
  "https://sim.pseudoef.pp.ua/",
  "https://github.com/pseudoef/gordaya-beauty",
  "https://github.com/pseudoef/homelab-panel",
  "https://github.com/pseudoef/tech-support-crm",
  "https://github.com/pseudoef/support-rage-sim",
  "https://github.com/pseudoef/wireguard-panel",
  "mailto:sano.ivanovskiy@gmail.com",
  "https://t.me/John_doe1488",
  "https://github.com/pseudoef",
];

requiredLinks.forEach((link) => {
  check(index.includes(`href="${link}"`), `index.html missing required link: ${link}`);
});

const projectCardCount = (index.match(/<article\s+class="project\b/g) || []).length;
check(projectCardCount === 5, `expected 5 project cards, found ${projectCardCount}`);

const sketchLabelCount = (index.match(/class="shot-label">Схема интерфейса</g) || []).length;
check(sketchLabelCount === 5, `expected 5 interface sketch labels, found ${sketchLabelCount}`);
check(!index.includes("Плейсхолдер"), "index.html still contains placeholder copy");

check(/class="skip-link"/.test(index), "index.html missing skip link");
check(/<header\b/.test(index), "index.html missing header landmark");
check(/<nav\b/.test(index), "index.html missing nav landmark");
check(/<main\b/.test(index), "index.html missing main landmark");
check(/<footer\b/.test(index), "index.html missing footer landmark");
check((index.match(/<h1\b/g) || []).length === 1, "index.html must contain exactly one h1");

const allowedSchemes = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const readTarget = (file) => {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "";
  }
};

for (const htmlFile of htmlFiles) {
  const html = read(htmlFile);
  const filePath = join(root, htmlFile);
  const ids = new Map();
  const idPattern = /\bid="([^"]+)"/g;
  let idMatch;

  while ((idMatch = idPattern.exec(html))) {
    const id = idMatch[1];
    ids.set(id, (ids.get(id) || 0) + 1);
  }

  for (const [id, count] of ids) {
    check(count === 1, `${htmlFile} has duplicate id="${id}" (${count} occurrences)`);
  }

  const attrPattern = /\b(href|src)="([^"]*)"/g;
  let attrMatch;

  while ((attrMatch = attrPattern.exec(html))) {
    const value = attrMatch[2].trim();
    if (!value || value.startsWith("#") && value.length === 1) continue;
    if (allowedSchemes.test(value)) continue;

    const hashIndex = value.indexOf("#");
    const fragment = hashIndex >= 0 ? value.slice(hashIndex + 1) : "";
    const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
    const pathname = withoutHash.split("?")[0];

    let targetFile = filePath;

    if (pathname) {
      if (pathname.startsWith("/")) {
        targetFile = resolve(root, `.${pathname}`);
      } else {
        targetFile = resolve(dirname(filePath), pathname);
      }

      if (pathname.endsWith("/")) {
        targetFile = join(targetFile, "index.html");
      } else if (existsSync(targetFile) && statSync(targetFile).isDirectory()) {
        targetFile = join(targetFile, "index.html");
      }

      check(existsSync(targetFile), `${htmlFile} links to missing local file: ${value}`);
    }

    if (fragment && existsSync(targetFile)) {
      const targetHtml = readTarget(targetFile);
      const fragmentPattern = new RegExp(`\\bid="${escapeRegExp(fragment)}"`);
      check(fragmentPattern.test(targetHtml), `${htmlFile} links to missing anchor: ${value}`);
    }
  }

  const assetTags = html.match(/<(?:link|script|img|source|video|audio)\b[^>]*>/gi) || [];

  assetTags.forEach((tag) => {
    const href = tag.match(/\bhref="([^"]+)"/i);
    const src = tag.match(/\bsrc="([^"]+)"/i);
    const value = href?.[1] || src?.[1];

    if (!value || allowedSchemes.test(value)) {
      if (/^https?:/i.test(value || "") && /^<link\b/i.test(tag) && !/rel="[^"]*(?:stylesheet|icon|preload|manifest)/i.test(tag)) {
        return;
      }
      check(!/^https?:/i.test(value || ""), `${htmlFile} loads an external asset: ${value}`);
    }
  });

  const anchors = html.match(/<a\b[^>]*>/gi) || [];
  anchors.forEach((tag) => {
    if (/target="_blank"/i.test(tag)) {
      check(/rel="[^"]*noopener[^"]*"/i.test(tag), `${htmlFile} has target="_blank" without rel="noopener": ${tag.slice(0, 120)}`);
    }
  });

  check(!/\sstyle="/i.test(html), `${htmlFile} contains an inline style attribute`);
  check(!/\son[a-z]+="/i.test(html), `${htmlFile} contains an inline event handler`);
}

check(!/@import\b/i.test(styles), "styles.css must not use @import");
check(!/@font-face\b/i.test(styles), "styles.css must not load external fonts");
check(!/url\(\s*["']?https?:/i.test(styles), "styles.css must not reference remote URLs");
check(styles.length > 1000, "styles.css appears to be empty");
check(script.length > 500, "main.js appears to be empty");

const png = readFileSync(join(root, "assets/og-image.png"));
check(png.subarray(1, 4).toString("ascii") === "PNG", "og-image.png is not a PNG file");
check(png.readUInt32BE(16) === 1200, "og-image.png must be 1200px wide");
check(png.readUInt32BE(20) === 630, "og-image.png must be 630px tall");

const sitemapLocs = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
const expectedSitemap = [
  "https://pseudoef.pp.ua/",
  "https://www.pseudoef.pp.ua/",
  "https://gordaya.pp.ua/",
  "https://panel.pseudoef.pp.ua/",
  "https://crm.pseudoef.pp.ua/",
  "https://sim.pseudoef.pp.ua/",
];

expectedSitemap.forEach((url) => {
  check(sitemapLocs.includes(url), `sitemap.xml missing URL: ${url}`);
});

check(/Sitemap:\s+https:\/\/pseudoef\.pp\.ua\/sitemap\.xml/i.test(robots), "robots.txt must reference the sitemap");
check(/User-agent:\s*\*/i.test(robots), "robots.txt must define a user agent");
check(/Allow:\s*\//i.test(robots), "robots.txt must allow indexing");
check(/MIT License/i.test(license), "LICENSE must contain the MIT license text");

if (errors.length > 0) {
  console.error(`FAILED: ${errors.length} problem(s) found.`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`OK: ${checkCount} checks passed across ${htmlFiles.length} HTML pages.`);
