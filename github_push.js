const fs = require('fs');
const https = require('https');

const TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'fredbedetse/Afritan-Website';
const BRANCH = 'main';

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path,
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
  if (res.status === 200) return res.data.sha;
  return null;
}

async function pushFile(filePath, localPath, message) {
  const content = fs.readFileSync(localPath).toString('base64');
  const sha = await getFileSha(filePath);
  const body = { message, content, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await apiRequest('PUT', `/repos/${REPO}/contents/${filePath}`, body);
  if (res.status === 200 || res.status === 201) {
    console.log(`✓ Pushed: ${filePath}`);
  } else {
    console.error(`✗ Failed: ${filePath} — ${res.status}: ${JSON.stringify(res.data).slice(0, 200)}`);
    process.exit(1);
  }
}

async function main() {
  const files = [
    ['assets/index-CXD9k4jg.js', 'assets/index-CXD9k4jg.js'],
    ['assets/savane-ranger-boot.jpg', 'assets/savane-ranger-boot.jpg'],
    ['push_to_github.sh', 'push_to_github.sh'],
    ['package.json', 'package.json'],
    ['replit.md', 'replit.md'],
    ['github_push.js', 'github_push.js'],
  ];

  for (const [remotePath, localPath] of files) {
    if (fs.existsSync(localPath)) {
      await pushFile(remotePath, localPath, `Auto-sync: ${new Date().toISOString()}`);
    }
  }
  console.log('\nAll changes pushed to GitHub successfully.');
}

main().catch(err => { console.error(err); process.exit(1); });
