/**
 * ビルド時にバージョン番号を自動更新するスクリプト
 */
const fs = require('fs');
const path = require('path');

// package.jsonからバージョンを読み取る
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

console.log(`📦 Current version: ${version}`);

// versionManager.tsを更新
const versionManagerPath = path.join(__dirname, '..', 'src', 'utils', 'versionManager.ts');
let versionManagerContent = fs.readFileSync(versionManagerPath, 'utf8');
versionManagerContent = versionManagerContent.replace(
  /const CURRENT_VERSION = '[^']+'/,
  `const CURRENT_VERSION = '${version}'`
);
fs.writeFileSync(versionManagerPath, versionManagerContent, 'utf8');
console.log('✅ Updated versionManager.ts');

// sw.jsを更新
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
swContent = swContent.replace(
  /const APP_VERSION = '[^']+'/,
  `const APP_VERSION = '${version}'`
);
fs.writeFileSync(swPath, swContent, 'utf8');
console.log('✅ Updated sw.js');

console.log('🎉 Version sync complete!');
