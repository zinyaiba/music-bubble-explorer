#!/usr/bin/env node

/**
 * GitHub Pages Deployment Readiness Checker
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

const fs = require('fs')
const path = require('path')

class DeploymentChecker {
  constructor() {
    this.errors = []
    this.warnings = []
    this.info = []
  }

  log(level, message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
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
        this.info.push(message)
        console.log(`ℹ️  ${logMessage}`)
        break
      case 'success':
        console.log(`✅ ${logMessage}`)
        break
    }
  }

  checkFileExists(filePath, required = true) {
    const exists = fs.existsSync(filePath)
    if (!exists && required) {
      this.log('error', `Required file missing: ${filePath}`)
    } else if (!exists) {
      this.log('warning', `Optional file missing: ${filePath}`)
    } else {
      this.log('success', `File exists: ${filePath}`)
    }
    return exists
  }

  checkBuildOutput() {
    this.log('info', 'Checking build output...')
    
    const distDir = path.join(process.cwd(), 'dist')
    if (!this.checkFileExists(distDir)) {
      this.log('error', 'Build output directory not found. Run "npm run build" first.')
      return false
    }

    // 必須ファイルのチェック
    const requiredFiles = [
      'dist/index.html',
      'dist/assets'
    ]

    requiredFiles.forEach(file => {
      this.checkFileExists(file, true)
    })

    // アセットファイルのチェック
    const assetsDir = path.join(distDir, 'assets')
    if (fs.existsSync(assetsDir)) {
      const assets = fs.readdirSync(assetsDir, { recursive: true })
      const jsFiles = assets.filter(file => file.endsWith('.js'))
      const cssFiles = assets.filter(file => file.endsWith('.css'))
      
      this.log('info', `Found ${jsFiles.length} JavaScript files`)
      this.log('info', `Found ${cssFiles.length} CSS files`)
      
      if (jsFiles.length === 0) {
        this.log('error', 'No JavaScript files found in build output')
      }
      if (cssFiles.length === 0) {
        this.log('warning', 'No CSS files found in build output')
      }
    }

    return this.errors.length === 0
  }

  checkPWAFiles() {
    this.log('info', 'Checking PWA files...')
    
    const pwaFiles = [
      'public/manifest.json',
      'public/sw.js',
      'public/icons/icon-192x192.png',
      'public/icons/icon-512x512.png'
    ]

    pwaFiles.forEach(file => {
      this.checkFileExists(file, true)
    })

    // manifest.jsonの内容チェック
    if (fs.existsSync('public/manifest.json')) {
      try {
        const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'))
        
        const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons']
        requiredFields.forEach(field => {
          if (!manifest[field]) {
            this.log('error', `Missing required field in manifest.json: ${field}`)
          }
        })

        if (manifest.icons && manifest.icons.length > 0) {
          this.log('success', `Manifest contains ${manifest.icons.length} icon definitions`)
        } else {
          this.log('error', 'Manifest contains no icon definitions')
        }
      } catch (error) {
        this.log('error', `Invalid manifest.json: ${error.message}`)
      }
    }
  }

  checkGitHubPagesConfig() {
    this.log('info', 'Checking GitHub Pages configuration...')
    
    // GitHub Actions workflow
    this.checkFileExists('.github/workflows/deploy.yml', true)
    
    // Vite config for GitHub Pages
    if (this.checkFileExists('vite.config.ts')) {
      const viteConfig = fs.readFileSync('vite.config.ts', 'utf8')
      
      if (viteConfig.includes('base:') && viteConfig.includes('music-bubble-explorer')) {
        this.log('success', 'Vite base path configured for GitHub Pages')
      } else {
        this.log('error', 'Vite base path not configured for GitHub Pages')
      }
      
      if (viteConfig.includes('outDir: \'dist\'')) {
        this.log('success', 'Vite output directory configured correctly')
      } else {
        this.log('warning', 'Vite output directory may not be configured correctly')
      }
    }
  }

  checkMobileOptimization() {
    this.log('info', 'Checking mobile optimization...')
    
    // Viewport meta tag check
    if (this.checkFileExists('index.html')) {
      const indexHtml = fs.readFileSync('index.html', 'utf8')
      
      if (indexHtml.includes('viewport')) {
        this.log('success', 'Viewport meta tag found')
      } else {
        this.log('error', 'Viewport meta tag missing')
      }
      
      if (indexHtml.includes('apple-mobile-web-app')) {
        this.log('success', 'Apple mobile web app meta tags found')
      } else {
        this.log('warning', 'Apple mobile web app meta tags missing')
      }
    }

    // Responsive CSS check
    const responsiveFiles = [
      'src/styles/responsive-enhanced.css',
      'src/utils/mobileOptimization.ts'
    ]

    responsiveFiles.forEach(file => {
      this.checkFileExists(file, false)
    })
  }

  checkPerformance() {
    this.log('info', 'Checking performance optimizations...')
    
    const distDir = path.join(process.cwd(), 'dist')
    if (!fs.existsSync(distDir)) {
      this.log('warning', 'Cannot check performance - build output not found')
      return
    }

    // Bundle size check
    const assetsDir = path.join(distDir, 'assets')
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir, { recursive: true })
      let totalSize = 0
      
      files.forEach(file => {
        const filePath = path.join(assetsDir, file)
        if (fs.statSync(filePath).isFile()) {
          const size = fs.statSync(filePath).size
          totalSize += size
          
          if (file.endsWith('.js') && size > 500 * 1024) { // 500KB
            this.log('warning', `Large JavaScript file: ${file} (${Math.round(size / 1024)}KB)`)
          }
        }
      })
      
      const totalSizeMB = totalSize / (1024 * 1024)
      this.log('info', `Total bundle size: ${totalSizeMB.toFixed(2)}MB`)
      
      if (totalSizeMB > 5) {
        this.log('warning', 'Bundle size is quite large (>5MB)')
      } else {
        this.log('success', 'Bundle size is reasonable')
      }
    }

    // Check for source maps (should be disabled in production)
    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir, { recursive: true })
      const sourceMaps = files.filter(file => file.endsWith('.map'))
      
      if (sourceMaps.length > 0) {
        this.log('warning', `Found ${sourceMaps.length} source map files (consider disabling for production)`)
      } else {
        this.log('success', 'No source maps found (good for production)')
      }
    }
  }

  checkAccessibility() {
    this.log('info', 'Checking accessibility features...')
    
    const accessibilityFiles = [
      'src/utils/accessibility.ts'
    ]

    accessibilityFiles.forEach(file => {
      this.checkFileExists(file, false)
    })

    // Check for ARIA attributes in built HTML
    const indexPath = path.join(process.cwd(), 'dist', 'index.html')
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf8')
      
      if (html.includes('lang=')) {
        this.log('success', 'HTML lang attribute found')
      } else {
        this.log('error', 'HTML lang attribute missing')
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 DEPLOYMENT READINESS REPORT')
    console.log('='.repeat(60))
    
    console.log(`\n✅ Successful checks: ${this.info.length}`)
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
    
    console.log('\n' + '='.repeat(60))
    
    if (this.errors.length === 0) {
      console.log('🎉 READY FOR DEPLOYMENT!')
      console.log('Your application is ready to be deployed to GitHub Pages.')
      return true
    } else {
      console.log('🚫 NOT READY FOR DEPLOYMENT')
      console.log('Please fix the errors above before deploying.')
      return false
    }
  }

  run() {
    console.log('🔍 Starting deployment readiness check...\n')
    
    this.checkBuildOutput()
    this.checkPWAFiles()
    this.checkGitHubPagesConfig()
    this.checkMobileOptimization()
    this.checkPerformance()
    this.checkAccessibility()
    
    const isReady = this.generateReport()
    process.exit(isReady ? 0 : 1)
  }
}

// Run the checker
const checker = new DeploymentChecker()
checker.run()