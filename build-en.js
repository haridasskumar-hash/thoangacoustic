// Regenerates en/index.html from index.html. Run: node build-en.js
const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('<html lang="vi">', '<html lang="en">');

// Pre-render the English text of every bilingual element
html = html.replace(
  /(<(\w+)\b[^>]*\bdata-en="([^"]*)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
  (match, open, tag, en, inner, close) => open + en + close
);

// Keep in-page anchors on the English page
html = html.replace(/href="#/g, 'href="/en/#');

// Other pages open in English
html = html.replace(/href="(blog|menu|privacy)\.html"/g, 'href="$1.html?lang=en"');

// The language button offers Vietnamese
html = html.replace(/(<button class="lang-btn[^>]*>)EN(<\/button>)/g, '$1VI$2');

// Resolve assets from the site root; drop the source page's alternates and AMP link
html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  <base href="/">');
html = html.replace(/\s*<link rel="alternate" hreflang="[^"]*"[^>]*>/g, '');
html = html.replace(/\s*<link rel="amphtml"[^>]*>/, '');
html = html.replace(
  '<link rel="canonical" href="https://www.thoangacoustic.com/">',
  '<link rel="canonical" href="https://www.thoangacoustic.com/en/">\n' +
  '  <link rel="alternate" hreflang="en" href="https://www.thoangacoustic.com/en/">\n' +
  '  <link rel="alternate" hreflang="vi" href="https://www.thoangacoustic.com/">\n' +
  '  <link rel="alternate" hreflang="x-default" href="https://www.thoangacoustic.com/">'
);
html = html.replace(
  '<meta property="og:url" content="https://www.thoangacoustic.com/">',
  '<meta property="og:url" content="https://www.thoangacoustic.com/en/">'
);

fs.mkdirSync('en', { recursive: true });
fs.writeFileSync('en/index.html', html);
console.log('Wrote en/index.html');
