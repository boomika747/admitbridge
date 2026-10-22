const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_SITE = path.join(ROOT_DIR, 'dist-site');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

function run(command, cwd) {
  console.log(`\n> [${cwd}] ${command}`);
  execSync(command, { cwd, stdio: 'inherit', env: { ...process.env, VITE_BASE_PATH: undefined } });
}

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((child) => {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    });
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log('=== Building All Portals for GitHub Pages Deployment ===');

// 1. Build Student Frontend
run('npm run build', path.join(ROOT_DIR, 'student', 'frontend'));

// 2. Build Consultancy Frontend
run('npm run build', path.join(ROOT_DIR, 'consultancy', 'frontend'));

// 3. Build Admin Frontend
run('npm run build', path.join(ROOT_DIR, 'admin', 'frontend'));

// 4. Clean & Prepare dist-site
console.log('\n=== Assembling Unified Static Site ===');
if (fs.existsSync(DIST_SITE)) {
  fs.rmSync(DIST_SITE, { recursive: true, force: true });
}
fs.mkdirSync(DIST_SITE, { recursive: true });

// Copy Student frontend to root
copyRecursiveSync(path.join(ROOT_DIR, 'student', 'frontend', 'dist'), DIST_SITE);

// Copy Consultancy frontend to /consultancy
copyRecursiveSync(path.join(ROOT_DIR, 'consultancy', 'frontend', 'dist'), path.join(DIST_SITE, 'consultancy'));

// Copy Admin frontend to /admin
copyRecursiveSync(path.join(ROOT_DIR, 'admin', 'frontend', 'dist'), path.join(DIST_SITE, 'admin'));

// Copy College Finder static assets to /finder
copyRecursiveSync(path.join(ROOT_DIR, 'project', 'static'), path.join(DIST_SITE, 'finder'));

// 5. Add 404.html (SPA redirect)
const spa404Html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>AdmitBridge - Masters Admission Intelligence Platform</title>
    <script type="text/javascript">
      // Single Page Apps for GitHub Pages
      // https://github.com/rafgraph/spa-github-pages
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
`;
fs.writeFileSync(path.join(DIST_SITE, '404.html'), spa404Html, 'utf8');

// 6. Add .nojekyll
fs.writeFileSync(path.join(DIST_SITE, '.nojekyll'), '', 'utf8');

// 7. Duplicate into docs/ folder for branch/docs deployment option
if (fs.existsSync(DOCS_DIR)) {
  fs.rmSync(DOCS_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DOCS_DIR, { recursive: true });
copyRecursiveSync(DIST_SITE, DOCS_DIR);

console.log('\n=== Build Complete ===');
console.log(`- Unified site assembled in: ${DIST_SITE}`);
console.log(`- Documentation/deployment mirror in: ${DOCS_DIR}`);
