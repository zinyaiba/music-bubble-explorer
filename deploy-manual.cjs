const { execSync } = require('child_process');
const fs = require('fs');

console.log('Manual deployment script for GitHub Pages');

try {
  // 1. Build the project
  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 2. Create .nojekyll file to prevent Jekyll processing
  fs.writeFileSync('dist/.nojekyll', '');
  
  // 3. Create CNAME file if needed (optional)
  // fs.writeFileSync('dist/CNAME', 'your-domain.com');
  
  console.log('Build completed! Upload the dist/ folder contents to gh-pages branch manually.');
  console.log('Or use: npx gh-pages -d dist');
  
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}