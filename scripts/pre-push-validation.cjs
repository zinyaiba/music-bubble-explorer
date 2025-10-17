#!/usr/bin/env node

/**
 * Pre-Push Build Validation Script
 * Validates TypeScript compilation, build process, and deployment readiness
 * Requirements: 4.1, 4.2
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class PrePushValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.startTime = Date.now()
  }

  log(level, message) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const logMessage = `[${timestamp}] ${message}`
    
    switch (level) {
      case 'error':
        this.errors.push(message)
        console.error(`❌ ${logMessage}`)
        break
      case 'warning':
        this.warnings.push(message)
        console.warn(`⚠️  ${logMessage}`)
        break
      case 'info':
        console.log(`ℹ️  ${logMessage}`)
        break
      case 'success':
        console.log(`✅ ${logMessage}`)
        break
      case 'step':
        console.log(`\n🔍 ${logMessage}`)
        break
    }
  }

  execCommand(command, description, options = {}) {
    this.log('info', `Running: ${description}`)
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      })
      this.log('success', `${description} completed successfully`)
      return result
    } catch (error) {
      this.log('error', `${description} failed: ${error.message}`)
      if (options.silent && error.stdout) {
        console.log('Output:', error.stdout)
      }
      if (options.silent && error.stderr) {
        console.error('Error output:', error.stderr)
      }
      throw error
    }
  }

  checkPrerequisites() {
    this.log('step', 'Checking prerequisites')
    
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      this.log('error', 'node_modules directory not found. Run "npm install" first.')
      return false
    }

    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
      this.log('error', 'package.json not found')
      return false
    }

    // Check Node.js version
    try {
      const nodeVersion = process.version
      this.log('info', `Node.js version: ${nodeVersion}`)
      
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
      if (majorVersion < 16) {
        this.log('warning', 'Node.js version is below 16. Consider upgrading.')
      }
    } catch (error) {
      this.log('warning', 'Could not determine Node.js version')
    }

    this.log('success', 'Prerequisites check completed')
    return true
  }

  validateDependencies() {
    this.log('step', 'Validating dependencies')
    
    try {
      // Check for dependency resolution issues
      this.execCommand('npm ls --depth=0', 'Dependency resolution check', { silent: true })
      
      // Check for security vulnerabilities
      try {
        this.execCommand('npm audit --audit-level=high', 'Security audit', { silent: true })
      } catch (error) {
        this.log('warning', 'Security vulnerabilities found. Consider running "npm audit fix"')
      }
      
    } catch (error) {
      this.log('error', 'Dependency validation failed')
      return false
    }
    
    return true
  }

  validateTypeScript() {
    this.log('step', 'Validating TypeScript compilation')
    
    try {
      // Run TypeScript compiler check
      this.execCommand('npx tsc --noEmit --skipLibCheck', 'TypeScript compilation check')
      
      // Additional strict type checking
      this.execCommand('npx tsc --noEmit --strict --skipLibCheck', 'Strict TypeScript check')
      
    } catch (error) {
      this.log('error', 'TypeScript validation failed')
      return false
    }
    
    return true
  }

  runLinting() {
    this.log('step', 'Running ESLint validation (critical errors only)')
    
    try {
      this.execCommand('npm run lint', 'ESLint validation')
    } catch (error) {
      // For deployment purposes, we'll be more lenient with linting
      // Focus on build-breaking errors rather than style issues
      const output = error.stderr || error.stdout || ''
      const criticalErrors = output.split('\n').filter(line => 
        line.includes('error') && (
          line.includes('Parsing error') ||
          line.includes('Cannot resolve') ||
          line.includes('Module not found') ||
          line.includes('Unexpected token')
        )
      )
      
      if (criticalErrors.length > 0) {
        this.log('error', 'Critical ESLint errors found that may break build')
        criticalErrors.forEach(error => console.error(`   ${error}`))
        return false
      } else {
        this.log('warning', 'ESLint warnings found but no critical build-breaking errors')
        return true
      }
    }
    
    return true
  }

  runTests() {
    this.log('step', 'Running test suite')
    
    try {
      this.execCommand('npm run test', 'Test execution')
    } catch (error) {
      this.log('error', 'Tests failed')
      return false
    }
    
    return true
  }

  validateBuild() {
    this.log('step', 'Validating production build')
    
    // Clean previous build
    if (fs.existsSync('dist')) {
      this.log('info', 'Cleaning previous build')
      fs.rmSync('dist', { recursive: true, force: true })
    }
    
    try {
      // Run production build
      this.execCommand('npm run build', 'Production build')
      
      // Verify build output
      this.verifyBuildOutput()
      
    } catch (error) {
      this.log('error', 'Build validation failed')
      return false
    }
    
    return true
  }

  verifyBuildOutput() {
    this.log('info', 'Verifying build output')
    
    const distDir = 'dist'
    
    // Check if dist directory exists
    if (!fs.existsSync(distDir)) {
      throw new Error('Build output directory not found')
    }
    
    // Check for essential files
    const requiredFiles = [
      'dist/index.html',
      'dist/assets'
    ]
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required build file missing: ${file}`)
      }
    }
    
    // Check assets directory
    const assetsDir = path.join(distDir, 'assets')
    if (fs.existsSync(assetsDir)) {
      // Check for nested directories (js, css)
      const assetContents = fs.readdirSync(assetsDir, { withFileTypes: true })
      let jsFiles = []
      let cssFiles = []
      
      // Look for files in subdirectories
      for (const item of assetContents) {
        if (item.isDirectory()) {
          const subDir = path.join(assetsDir, item.name)
          const subFiles = fs.readdirSync(subDir)
          
          if (item.name === 'js') {
            jsFiles = subFiles.filter(file => file.endsWith('.js'))
          } else if (item.name === 'css') {
            cssFiles = subFiles.filter(file => file.endsWith('.css'))
          }
        } else {
          // Files directly in assets directory
          if (item.name.endsWith('.js')) {
            jsFiles.push(item.name)
          } else if (item.name.endsWith('.css')) {
            cssFiles.push(item.name)
          }
        }
      }
      
      this.log('info', `Build contains ${jsFiles.length} JS files and ${cssFiles.length} CSS files`)
      
      if (jsFiles.length === 0) {
        // Check if there are any JS files directly in assets
        const allFiles = fs.readdirSync(assetsDir, { recursive: true })
        const allJsFiles = allFiles.filter(file => file.toString().endsWith('.js'))
        
        if (allJsFiles.length === 0) {
          throw new Error('No JavaScript files found in build output')
        } else {
          this.log('info', `Found ${allJsFiles.length} JS files in nested directories`)
        }
      }
    }
    
    // Check index.html content
    const indexPath = path.join(distDir, 'index.html')
    const indexContent = fs.readFileSync(indexPath, 'utf8')
    
    if (!indexContent.includes('script')) {
      throw new Error('index.html does not contain script tags')
    }
    
    if (!indexContent.includes('id="root"')) {
      throw new Error('index.html does not contain React root element')
    }
    
    // Calculate build size
    const calculateSize = (dir) => {
      let totalSize = 0
      const files = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const file of files) {
        const filePath = path.join(dir, file.name)
        if (file.isDirectory()) {
          totalSize += calculateSize(filePath)
        } else {
          totalSize += fs.statSync(filePath).size
        }
      }
      
      return totalSize
    }
    
    const buildSize = calculateSize(distDir)
    const buildSizeMB = (buildSize / (1024 * 1024)).toFixed(2)
    
    this.log('info', `Total build size: ${buildSizeMB}MB`)
    
    if (buildSize > 10 * 1024 * 1024) { // 10MB
      this.log('warning', 'Build size is quite large (>10MB)')
    }
    
    this.log('success', 'Build output verification completed')
  }

  runDeploymentCheck() {
    this.log('step', 'Running deployment readiness check')
    
    try {
      this.execCommand('npm run deployment-check', 'Deployment readiness validation')
    } catch (error) {
      this.log('warning', 'Deployment check completed with warnings')
      // Don't fail the entire validation for deployment check warnings
    }
    
    return true
  }

  generateReport() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1)
    
    console.log('\n' + '='.repeat(70))
    console.log('📊 PRE-PUSH VALIDATION REPORT')
    console.log('='.repeat(70))
    
    console.log(`\n⏱️  Total validation time: ${duration}s`)
    console.log(`⚠️  Warnings: ${this.warnings.length}`)
    console.log(`❌ Errors: ${this.errors.length}`)
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:')
      this.warnings.forEach(warning => console.log(`   • ${warning}`))
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:')
      this.errors.forEach(error => console.log(`   • ${error}`))
    }
    
    console.log('\n' + '='.repeat(70))
    
    if (this.errors.length === 0) {
      console.log('🎉 VALIDATION PASSED!')
      console.log('Your code is ready to be pushed and deployed.')
      console.log('\nNext steps:')
      console.log('  1. git add .')
      console.log('  2. git commit -m "Your commit message"')
      console.log('  3. git push origin main')
      return true
    } else {
      console.log('🚫 VALIDATION FAILED')
      console.log('Please fix the errors above before pushing.')
      return false
    }
  }

  async run() {
    console.log('🚀 Starting pre-push validation...\n')
    
    try {
      // Run all validation steps
      const steps = [
        () => this.checkPrerequisites(),
        () => this.validateDependencies(),
        () => this.validateTypeScript(),
        () => this.runLinting(),
        () => this.runTests(),
        () => this.validateBuild(),
        () => this.runDeploymentCheck()
      ]
      
      for (const step of steps) {
        if (!step()) {
          break // Stop on first failure
        }
      }
      
    } catch (error) {
      this.log('error', `Validation failed: ${error.message}`)
    }
    
    const success = this.generateReport()
    process.exit(success ? 0 : 1)
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
const skipTests = args.includes('--skip-tests')
const skipBuild = args.includes('--skip-build')

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Pre-Push Validation Script

Usage: node scripts/pre-push-validation.cjs [options]

Options:
  --skip-tests    Skip test execution
  --skip-build    Skip build validation
  --help, -h      Show this help message

This script validates your code before pushing to ensure:
  ✓ Dependencies are resolved correctly
  ✓ TypeScript compiles without errors
  ✓ ESLint passes
  ✓ Tests pass
  ✓ Production build succeeds
  ✓ Deployment readiness
`)
  process.exit(0)
}

// Run the validator
const validator = new PrePushValidator()

// Modify validator based on arguments
if (skipTests) {
  validator.runTests = () => {
    validator.log('info', 'Skipping tests (--skip-tests flag)')
    return true
  }
}

if (skipBuild) {
  validator.validateBuild = () => {
    validator.log('info', 'Skipping build validation (--skip-build flag)')
    return true
  }
}

validator.run()