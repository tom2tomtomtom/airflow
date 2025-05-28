#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to replace console.log statements with conditional logging
function cleanupConsoleStatements(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace console.log with conditional logging (except for error cases)
    content = content.replace(
      /console\.log\((.*?)\);?/g,
      (match, args) => {
        // Keep console.error for actual errors
        if (args.includes('error') || args.includes('Error') || args.includes('err')) {
          return `console.error(${args});`;
        }
        modified = true;
        return `process.env.NODE_ENV === 'development' && console.log(${args});`;
      }
    );

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned up console statements in: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
  return false;
}

// Function to remove unused imports and fix variables
function removeUnusedImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix specific unused imports mentioned in build log
    if (filePath.includes('campaigns/[id].tsx')) {
      content = content.replace(
        /import.*getBudgetTotal.*from.*;\n/g,
        ''
      );
      modified = true;
    }

    // Fix unused variables by prefixing with underscore
    if (filePath.includes('assets.tsx')) {
      content = content.replace(
        /const\s+handleImageGenerated\s*=/g,
        'const _handleImageGenerated ='
      );
      modified = true;
    }

    // Fix unused parameters in supabase.ts
    if (filePath.includes('supabase.ts')) {
      content = content.replace(
        /\(table\)/g,
        '(_table)'
      );
      content = content.replace(
        /\(bucket\)/g,
        '(_bucket)'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed unused imports/variables in: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
  return false;
}

// Function to fix Next.js Image usage
function fixNextImageUsage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if Next.js Image is already imported
    const hasImageImport = content.includes("import Image from 'next/image'");
    
    // Replace <img> tags with Next.js Image component for specific files
    if (filePath.includes('assets.tsx') || filePath.includes('matrix.tsx') || filePath.includes('sign-off.tsx')) {
      content = content.replace(
        /<img\s+([^>]*?)src=\{([^}]*?)\}([^>]*?)>/g,
        (match, beforeSrc, src, afterSrc) => {
          modified = true;
          
          // Extract alt text if present
          const altMatch = (beforeSrc + afterSrc).match(/alt=\{([^}]*?)\}/);
          const alt = altMatch ? altMatch[1] : '""';
          
          return `<Image src={${src}} alt={${alt}} width={500} height={300} />`;
        }
      );

      // Add Image import if we made replacements and it's not already imported
      if (modified && !hasImageImport) {
        // Add import at the top with other React imports
        content = content.replace(
          /(import.*from ['"]react['"];?\n)/,
          '$1import Image from \'next/image\';\n'
        );
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed Next.js Image usage in: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
  return false;
}

// Main cleanup function
function cleanup() {
  console.log('🧹 Starting code cleanup...\n');

  // Get all TypeScript/JavaScript files
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const srcDir = './src';
  const pagesDir = './pages';
  
  let totalFiles = 0;
  let modifiedFiles = 0;

  function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    files.forEach(file => {
      const filePath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        processDirectory(filePath);
      } else if (file.isFile() && extensions.some(ext => file.name.endsWith(ext))) {
        totalFiles++;
        
        const wasModified = (
          cleanupConsoleStatements(filePath) |
          removeUnusedImports(filePath) |
          fixNextImageUsage(filePath)
        );
        
        if (wasModified) modifiedFiles++;
      }
    });
  }

  // Process both src and pages directories
  processDirectory(srcDir);
  processDirectory(pagesDir);

  console.log(`\n✨ Cleanup complete!`);
  console.log(`📁 Processed ${totalFiles} files`);
  console.log(`🔧 Modified ${modifiedFiles} files`);
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanup();
}

module.exports = { cleanup, cleanupConsoleStatements, removeUnusedImports, fixNextImageUsage };