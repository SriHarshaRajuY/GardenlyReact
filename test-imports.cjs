const fs = require('fs');
const path = require('path');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory() && file !== 'node_modules' && file !== 'dist') {
      checkDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        let importPath = match[1];
        if (importPath.startsWith('.')) {
          let resolvedPath = path.resolve(dir, importPath);
          let dirName = path.dirname(resolvedPath);
          let baseName = path.basename(resolvedPath);
          try {
            const actualFiles = fs.readdirSync(dirName);
            // Check if exact match exists
            if (!actualFiles.includes(baseName) && !actualFiles.includes(baseName + '.js') && !actualFiles.includes(baseName + '.jsx')) {
              // Now look for case-insensitive match
              const matchInsensitive = actualFiles.find(f => f.toLowerCase() === baseName.toLowerCase() || f.toLowerCase() === baseName.toLowerCase() + '.js' || f.toLowerCase() === baseName.toLowerCase() + '.jsx');
              if (matchInsensitive) {
                console.log('MISMATCH in ' + fullPath + ': ' + importPath + ' -> Actual file is ' + matchInsensitive);
              } else {
                console.log('NOT FOUND in ' + fullPath + ': ' + importPath);
              }
            }
          } catch(e) {}
        }
      }
    }
  }
}
checkDir('./client/src');
