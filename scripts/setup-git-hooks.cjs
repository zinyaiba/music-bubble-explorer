#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Git hooks for development...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed\n`);
    return false;
  }
}

// Check if we're in a git repository
if (!fs.existsSync('.git')) {
  console.error('❌ Not in a git repository. Please run this from the project root.');
  process.exit(1);
}

// Install husky if not already installed
if (!fs.existsSync('node_modules/husky')) {
  console.log('📦 Installing husky...');
  runCommand('npm install --save-dev husky', 'Installing husky');
}

// Install lint-staged if not already installed
if (!fs.existsSync('node_modules/lint-staged')) {
  console.log('📦 Installing lint-staged...');
  runCommand('npm install --save-dev lint-staged', 'Installing lint-staged');
}

// Initialize husky
runCommand('npx husky init', 'Initializing husky');

// Set up pre-commit hook
const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged && npm run type-check`;

fs.writeFileSync('.husky/pre-commit', preCommitHook);
console.log('✅ Pre-commit hook configured\n');

// Set up pre-push hook
const prePushHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run pre-push`;

fs.writeFileSync('.husky/pre-push', prePushHook);
console.log('✅ Pre-push hook configured\n');

// Make hooks executable (for Unix systems)
try {
  execSync('chmod +x .husky/pre-commit .husky/pre-push', { stdio: 'ignore' });
  console.log('✅ Made hooks executable\n');
} catch (error) {
  console.log('ℹ️  Could not make hooks executable (Windows system)\n');
}

// Test the setup
console.log('🧪 Testing the setup...');
runCommand('npm run pre-commit-check', 'Testing pre-commit validation');

console.log('🎉 Git hooks setup completed successfully!');
console.log('\nNext steps:');
console.log('1. Make some changes to your code');
console.log('2. Try committing - the pre-commit hook will run automatically');
console.log('3. Try pushing - the pre-push hook will run comprehensive validation');
console.log('\nManual commands:');
console.log('- npm run pre-commit-check  # Run pre-commit validation manually');
console.log('- npm run pre-push         # Run pre-push validation manually');
console.log('- npm run lint:fix         # Auto-fix linting issues');
console.log('- npm run format           # Auto-format code');