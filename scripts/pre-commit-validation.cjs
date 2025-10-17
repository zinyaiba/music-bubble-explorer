#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-commit validation...\n');

let hasErrors = false;

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} passed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed\n`);
    hasErrors = true;
    return false;
  }
}

function checkFileExists(filePath, description) {
  console.log(`📋 Checking ${description}...`);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists\n`);
    return true;
  } else {
    console.error(`❌ ${description} not found: ${filePath}\n`);
    hasErrors = true;
    return false;
  }
}

// Check essential files
checkFileExists('package.json', 'package.json');
checkFileExists('tsconfig.json', 'TypeScript config');
checkFileExists('vite.config.ts', 'Vite config');

// TypeScript compilation check
runCommand('npm run type-check', 'TypeScript compilation');

// ESLint check (informational only for now)
console.log('📋 ESLint validation (informational)...');
try {
  execSync('npm run lint -- --max-warnings 10000', { stdio: 'pipe' });
  console.log('✅ ESLint validation passed\n');
} catch (error) {
  console.warn('⚠️  ESLint found issues. Run "npm run lint" to see details.\n');
  console.warn('⚠️  Run "npm run lint:fix" to auto-fix some issues.\n');
  // Don't fail the commit for linting issues in this implementation
}

// Prettier format check (informational only)
console.log('📋 Prettier format check (informational)...');
try {
  execSync('npm run format:check', { stdio: 'pipe' });
  console.log('✅ All files are properly formatted\n');
} catch (error) {
  console.warn('⚠️  Some files need formatting. Run "npm run format" to fix.\n');
  // Don't fail the commit for formatting issues
}

// Check for common issues
console.log('📋 Checking for common issues...');

// Check for console.log statements in production code
try {
  const srcFiles = execSync('find src -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' }).trim().split('\n');
  let consoleLogFound = false;
  
  srcFiles.forEach(file => {
    if (file && fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('console.log') && !file.includes('test') && !file.includes('debug')) {
        console.warn(`⚠️  console.log found in ${file}`);
        consoleLogFound = true;
      }
    }
  });
  
  if (consoleLogFound) {
    console.warn('⚠️  Consider removing console.log statements from production code\n');
  } else {
    console.log('✅ No console.log statements found in production code\n');
  }
} catch (error) {
  console.log('ℹ️  Could not check for console.log statements\n');
}

// Check for TODO comments
try {
  const result = execSync('grep -r "TODO\\|FIXME" src/ || true', { encoding: 'utf8' });
  if (result.trim()) {
    console.warn('⚠️  TODO/FIXME comments found:');
    console.warn(result);
    console.warn('Consider addressing these before committing\n');
  } else {
    console.log('✅ No TODO/FIXME comments found\n');
  }
} catch (error) {
  console.log('ℹ️  Could not check for TODO comments\n');
}

if (hasErrors) {
  console.error('❌ Pre-commit validation failed. Please fix the issues above before committing.');
  process.exit(1);
} else {
  console.log('🎉 All pre-commit checks passed! Ready to commit.');
  process.exit(0);
}