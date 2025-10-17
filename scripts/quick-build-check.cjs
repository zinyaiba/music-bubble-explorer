#!/usr/bin/env node

/**
 * Quick Build Check Script
 * Fast validation for TypeScript and basic build readiness
 * Requirements: 4.1, 4.2
 */

const { execSync } = require('child_process')
const fs = require('fs')

class QuickBuildChecker {
  constructor() {
    this.errors = []
    this.startTime = Date.now()
  }

  log(level, message) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    
    switch (level) {
      case 'error':
        this.errors.push(message)
        console.error(`❌ [${timestamp}] ${message}`)
        break
      case 'success':
        console.log(`✅ [${timestamp}] ${message}`)
        break
      case 'info':
        console.log(`ℹ️  [${timestamp}] ${message}`)
        break
      case 'step':
        console.log(`\n🔍 ${message}`)
        break
    }
  }

  execCommand(command, description) {
    this.log('info', `Running: ${description}`)
    try {
      execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe'
      })
      this.log('success', `${description} passed`)
      return true
    } catch (error) {
      this.log('error', `${description} failed`)
      // Show only the first few lines of error for quick feedback
      const errorLines = error.stderr?.split('\n').slice(0, 5).join('\n') || error.message
      console.error(`   ${errorLines}`)
      return false
    }
  }

  quickTypeScriptCheck() {
    this.log('step', 'Quick TypeScript validation')
    return this.execCommand('npx tsc --noEmit --skipLibCheck', 'TypeScript compilation')
  }

  quickLintCheck() {
    this.log('step', 'Quick lint check (errors only)')
    try {
      // Run lint but only fail on errors, not warnings
      execSync('npm run lint', { 
        encoding: 'utf8', 
        stdio: 'pipe'
      })
      this.log('success', 'ESLint validation passed')
      return true
    } catch (error) {
      // Check if there are actual errors (not just warnings)
      const output = error.stderr || error.stdout || ''
      const errorCount = (output.match(/\d+ error/g) || []).length
      const hasErrors = output.includes('error') && errorCount > 0
      
      if (hasErrors) {
        this.log('error', 'ESLint found critical errors')
        // Show only error lines, not warnings
        const errorLines = output.split('\n')
          .filter(line => line.includes('error'))
          .slice(0, 10) // Show first 10 errors
          .join('\n')
        if (errorLines) {
          console.error(`   ${errorLines}`)
        }
        return false
      } else {
        this.log('success', 'ESLint validation passed (warnings ignored for quick check)')
        return true
      }
    }
  }

  checkBuildPrerequisites() {
    this.log('step', 'Checking build prerequisites')
    
    // Check if essential files exist
    const essentialFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'src/main.tsx',
      'index.html'
    ]
    
    let allExist = true
    for (const file of essentialFiles) {
      if (!fs.existsSync(file)) {
        this.log('error', `Essential file missing: ${file}`)
        allExist = false
      }
    }
    
    if (allExist) {
      this.log('success', 'All essential files present')
    }
    
    return allExist
  }

  generateQuickReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1)
    
    console.log('\n' + '='.repeat(50))
    console.log('⚡ QUICK BUILD CHECK REPORT')
    console.log('='.repeat(50))
    
    console.log(`\n⏱️  Check time: ${duration}s`)
    console.log(`❌ Errors: ${this.errors.length}`)
    
    if (this.errors.length > 0) {
      console.log('\n❌ ISSUES FOUND:')
      this.errors.forEach(error => console.log(`   • ${error}`))
      console.log('\n💡 Run "npm run pre-push" for detailed validation')
    }
    
    console.log('\n' + '='.repeat(50))
    
    if (this.errors.length === 0) {
      console.log('🎉 QUICK CHECK PASSED!')
      console.log('Basic build requirements are met.')
      return true
    } else {
      console.log('🚫 ISSUES DETECTED')
      console.log('Fix the issues above before building.')
      return false
    }
  }

  run() {
    console.log('⚡ Running quick build check...\n')
    
    // Run quick checks
    this.checkBuildPrerequisites()
    this.quickTypeScriptCheck()
    this.quickLintCheck()
    
    const success = this.generateQuickReport()
    process.exit(success ? 0 : 1)
  }
}

// Handle help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Quick Build Check Script

Usage: node scripts/quick-build-check.cjs

This script performs a fast validation of:
  ✓ Essential files presence
  ✓ TypeScript compilation
  ✓ ESLint validation

For comprehensive validation, use: npm run pre-push
`)
  process.exit(0)
}

// Run the checker
const checker = new QuickBuildChecker()
checker.run()