const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'fredbedetse/Afritan-Website';
const BRANCH = 'main';

const IGNORE = new Set([
  '.git', 'node_modules', '.local', 'attached_assets',
  '.replit', '.gitignore', '.upm', 'replit.nix'
]);

function apiRequest(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path: apiPath,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'Afritan-Push-Script',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getFileSha(filePath) {
  const res = await apiRequest('GET', `/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`, null);
  if (res.status === 200 && res.data.sha) return res.data.sha;
  return null;
}

async function pushFile(remotePath, localPath, message) {
  const content = fs.readFileSync(localPath).toString('base64');
  const sha = await getFileSha(remotePath);
  const body = { message, content, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await apiRequest('PUT', `/repos/${REPO}/contents/${remotePath}`, body);
  if (res.status === 200 || res.status === 201) {
    console.log(`  ✓ ${remotePath}`);
  } else {
    console.error(`  ✗ ${remotePath} — ${res.status}: ${JSON.stringify(res.data).slice(0, 200)}`);
    process.exit(1);
  }
}

function collectFiles(dir, base = '') {
  const results = [];
  for (const entry of fs.readdirSync(dir)) {
    if (IGNORE.has(entry) || entry.startsWith('.')) continue;
    const fullPath = path.join(dir, entry);
    const relPath = base ? `${base}/${entry}` : entry;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...collectFiles(fullPath, relPath));
    } else {
      results.push([relPath, fullPath]);
    }
  }
  return results;
}

async function main() {
  if (!TOKEN) { console.error('ERROR: GITHUB_TOKEN not set.'); process.exit(1); }

  const message = `Auto-sync: ${new Date().toISOString()}`;
  const files = collectFiles('.');

  console.log(`Pushing ${files.length} files to GitHub...`);
  for (const [remotePath, localPath] of files) {
    await pushFile(remotePath, localPath, message);
  }
  console.log('\nAll changes pushed to GitHub successfully.');
}

main().catch(err => { console.error(err); process.exit(1); });
