const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

async function updateImports() {
  // Find all JavaScript files in the src directory
  const files = await glob('src/**/*.js', { 
    cwd: path.join(__dirname, '..'),
    ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/build/**'] 
  });

  for (const file of files) {
    const fullPath = path.join(__dirname, '..', file);
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Function to calculate relative path
    const getRelativePath = (importPath) => {
      // Calculate the absolute path of the target module
      const absolutePath = path.join(__dirname, '..', 'src', importPath);
      
      // Get the directory of the current file
      const currentDir = path.dirname(fullPath);
      
      // Calculate relative path
      let relativePath = path.relative(currentDir, absolutePath);
      
      // Convert Windows paths to forward slashes
      relativePath = relativePath.replace(/\\/g, '/');
      
      // Ensure the path starts with ./ or ../
      if (!relativePath.startsWith('.')) {
        relativePath = `./${relativePath}`;
      }
      
      return relativePath;
    };

    // Replace require() imports
    content = content.replace(
      /require\(\s*['"]@\/([^'"\s]+)['"]\s*\)/g, 
      (match, importPath) => {
        const relativePath = getRelativePath(importPath);
        modified = true;
        return `require('${relativePath}')`;
      }
    );

    // Replace ES6 imports
    content = content.replace(
      /from\s+['"]@\/([^'"\s]+)['"]/g, 
      (match, importPath) => {
        const relativePath = getRelativePath(importPath);
        modified = true;
        return `from '${relativePath}'`;
      }
    );

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Updated imports in ${file}`);
    }
  }

  console.log('\n🎉 All imports have been updated to use relative paths!');
}

// Run the script
updateImports().catch(error => {
  console.error('❌ Error updating imports:', error);
  process.exit(1);
});
