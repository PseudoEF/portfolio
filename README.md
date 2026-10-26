# PSEUDOEF — portfolio

A dark, static portfolio for a senior full-stack / self-hosting engineer. Russian-first content with short English labels. No build step, no framework, no external fonts, CDNs, or hotlinked images.

The site is designed for `https://pseudoef.pp.ua/` and the `www` host. Project demos are linked as external sites; screenshots are local placeholders until real captures are added.

## What is inside

- Hero with availability status, positioning, primary and secondary CTAs.
- Five project cards with problem, solution, outcome, stack tags, and links.
- Homelab case study with a responsive HTML/CSS architecture diagram.
- Stack, engineering practices, contact, and footer.
- Copy-to-clipboard for email, Telegram, and GitHub with a legacy fallback.
- Mobile navigation, skip link, visible focus states, reduced-motion support, and scroll reveals via `IntersectionObserver`.
- `404.html`, `robots.txt`, `sitemap.xml`, inline SVG favicon, and a local Open Graph image.
- A dependency-free CI check for required metadata, local links, anchors, duplicate IDs, and external asset leaks.

## Structure

```text
.
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── assets/
│   ├── css/styles.css
│   ├── js/main.js
│   ├── favicon.svg
│   ├── og-image.svg
│   └── og-image.png
├── docs/
│   ├── adr/0001-static-portfolio-on-homelab.md
│   └── screenshots/.gitkeep
├── scripts/check.mjs
├── .github/workflows/ci.yml
├── .editorconfig
├── .gitignore
├── LICENSE
└── README.md
```

## Local preview

Any static server works:

```bash
cd portfolio
python3 -m http.server 8080
```

Open `http://localhost:8080/`. A server is preferred over `file://` because the page uses root-relative asset paths and clipboard access is more reliable in a secure context (`localhost` counts).

## Deploy to nginx

Copy the repository contents to the web root; no build or install step is needed:

```bash
rsync -av --delete ./ user@server:/var/www/pseudoef.pp.ua/
```

Example nginx configuration. The `www` host redirects to the apex, while the apex serves the static files. If your TLS is terminated by Cloudflare Tunnel, point the tunnel at this nginx listener and keep the origin private.

```nginx
server {
    listen 80;
    server_name www.pseudoef.pp.ua;
    return 301 https://pseudoef.pp.ua$request_uri;
}

server {
    listen 80;
    server_name pseudoef.pp.ua;
    root /var/www/pseudoef.pp.ua;
    index index.html;

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(?:css|js|svg|png|webp|jpg|jpeg|ico)$ {
        try_files $uri =404;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "DENY" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
}
```

The page has no inline scripts or inline styles, so the CSP can stay strict. If you add inline JSON-LD or analytics later, update the policy deliberately.

## Replace content

All personal data and links are plain HTML. Search for the placeholders and replace them in one pass:

```bash
rg -n "PSEUDOEF|hello@pseudoef|@pseudoef|github.com/pseudoef|gordaya\.pp\.ua|panel\.pseudoef|crm\.pseudoef|sim\.pseudoef" .
```

Update these locations when changing the domain:

- `<link rel="canonical">`, Open Graph and Twitter meta tags in `index.html`.
- `https://pseudoef.pp.ua/assets/og-image.png` in the social image tags.
- `robots.txt` and `sitemap.xml`.
- The email address in `mailto:` links and copy buttons.
- The footer phrase and availability text if they stop being accurate.

GitHub repository URLs use `https://github.com/pseudoef/<repo>` placeholders. The current slugs are `gordaya-beauty`, `homelab-panel`, `tech-support-crm`, `support-rage-sim`, and `wireguard-panel`; adjust them to the real repository names. The WireGuard card intentionally has no public live demo because it is a local Windows tool.

### Screenshots

Each project uses a styled HTML/CSS placeholder with a visible `docs/screenshots/...` path. Replace the placeholder markup with a real local image when available. Recommended captures: 1600×1000 WebP, no secrets or real client data.

```html
<div class="shot-canvas">
  <img src="/docs/screenshots/gordaya-beauty.webp" width="1600" height="1000" alt="Интерфейс онлайн-записи Gordaya Beauty" loading="lazy">
</div>
```

The container already reserves space with `aspect-ratio`, so the layout does not shift. Add a small CSS rule for `img` if you want `object-fit: cover; width: 100%; height: 100%;`. Do not hotlink screenshots from another host.

### Open Graph image

`assets/og-image.png` is a local 1200×630 placeholder generated from `assets/og-image.svg`. Replace both files if the branding changes, or commit a new PNG and keep the meta tags pointing at it. The SVG is the editable source; the PNG is what most social platforms expect.

## Accessibility and performance notes

- Semantic landmarks (`header`, `nav`, `main`, `section`, `article`, `footer`) and a skip link.
- One `h1`; section and card headings follow in order.
- Keyboard-friendly mobile navigation with `aria-expanded`, Escape to close, and focus return to the toggle.
- Visible `:focus-visible` outlines, accessible names on icon links and copy buttons.
- Color choices target readable contrast on the dark background; muted text is not used for essential body copy.
- `prefers-reduced-motion` disables smooth scrolling, the status pulse, transitions, and scroll reveals.
- Reveals are progressive enhancement: without JavaScript, `.js` is never added and content stays visible.
- System font stack only; no font download or render-blocking third-party request.
- No images are loaded for the page itself, so there is no image layout shift. Placeholder media uses `aspect-ratio`.
- Small, dependency-free JavaScript with deferred loading.
- Static assets can be cached aggressively; HTML should be revalidated on deploy.

## Validation

The repository has no build step. Run the local check and JavaScript syntax check:

```bash
node scripts/check.mjs
node --check assets/js/main.js
```

The same commands run in GitHub Actions on pushes and pull requests. The check verifies required metadata, local files and anchors, duplicate IDs, required project links, sitemap entries, and that stylesheets/scripts do not point at external hosts.

## License

MIT. See `LICENSE`.
