#!/usr/bin/env python3
"""
Fix TypeScript unused imports and variables
"""

import re
import sys
import subprocess
import json
from pathlib import Path

def get_typescript_errors():
    """Run type-check and get all errors"""
    try:
        result = subprocess.run(['npm', 'run', 'type-check'], 
                              capture_output=True, text=True)
        return result.stderr
    except Exception as e:
        print(f"Error running type-check: {e}")
        return ""

def parse_unused_errors(error_output):
    """Parse TS6133 errors (unused variables/imports)"""
    errors = []
    lines = error_output.split('\n')
    
    for line in lines:
        # Match pattern: src/file.tsx(line,col): error TS6133: 'variable' is declared but its value is never read.
        match = re.match(r'(.*?)\((\d+),(\d+)\): error TS6133: \'(.*?)\' is declared but its value is never read\.', line)
        if match:
            errors.append({
                'file': match.group(1),
                'line': int(match.group(2)),
                'col': int(match.group(3)),
                'variable': match.group(4)
            })
    
    return errors

def fix_unused_import(file_path, variable_name):
    """Remove unused import from file"""
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
        
        modified = False
        new_lines = []
        
        for i, line in enumerate(lines):
            # Check if this line contains an import statement with the variable
            if 'import' in line and variable_name in line:
                # Handle different import patterns
                
                # Pattern 1: import { A, B, C } from 'module'
                if re.search(rf'import\s*{{[^}}]*\b{re.escape(variable_name)}\b[^}}]*}}', line):
                    # Remove just this variable from the import
                    new_line = re.sub(rf',\s*{re.escape(variable_name)}\b', '', line)
                    new_line = re.sub(rf'\b{re.escape(variable_name)}\s*,', '', new_line)
                    new_line = re.sub(rf'\b{re.escape(variable_name)}\b', '', new_line)
                    
                    # Clean up empty imports
                    new_line = re.sub(r'import\s*{\s*}\s*from', 'import {} from', new_line)
                    
                    # If import is now empty, skip the line
                    if re.search(r'import\s*{\s*}\s*from', new_line):
                        modified = True
                        continue
                    else:
                        new_lines.append(new_line)
                        modified = True
                
                # Pattern 2: import A from 'module'
                elif re.search(rf'import\s+{re.escape(variable_name)}\s+from', line):
                    # Skip this line entirely
                    modified = True
                    continue
                
                # Pattern 3: import * as A from 'module'
                elif re.search(rf'import\s*\*\s*as\s+{re.escape(variable_name)}\s+from', line):
                    # Skip this line entirely
                    modified = True
                    continue
                    
                else:
                    new_lines.append(line)
            else:
                # Check for unused variable declarations
                if re.search(rf'^\s*(const|let|var)\s+.*\b{re.escape(variable_name)}\b', line):
                    # Check if it's a destructuring assignment we can simplify
                    if re.search(rf'const\s*{{\s*[^}}]*\b{re.escape(variable_name)}\b[^}}]*}}\s*=', line):
                        # Remove just this variable from destructuring
                        new_line = re.sub(rf',\s*{re.escape(variable_name)}\b', '', line)
                        new_line = re.sub(rf'\b{re.escape(variable_name)}\s*,', '', new_line)
                        new_line = re.sub(rf'\b{re.escape(variable_name)}\b', '', new_line)
                        new_lines.append(new_line)
                        modified = True
                    else:
                        new_lines.append(line)
                else:
                    new_lines.append(line)
        
        if modified:
            with open(file_path, 'w') as f:
                f.writelines(new_lines)
            return True
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
    
    return False

def main():
    print("🔍 Getting TypeScript errors...")
    error_output = get_typescript_errors()
    
    print("📋 Parsing unused variable errors...")
    unused_errors = parse_unused_errors(error_output)
    
    print(f"Found {len(unused_errors)} unused variables/imports\n")
    
    # Group errors by file
    errors_by_file = {}
    for error in unused_errors:
        if error['file'] not in errors_by_file:
            errors_by_file[error['file']] = []
        errors_by_file[error['file']].append(error)
    
    # Fix errors file by file
    fixed_count = 0
    for file_path, errors in errors_by_file.items():
        print(f"Fixing {file_path}...")
        for error in errors:
            if fix_unused_import(file_path, error['variable']):
                fixed_count += 1
                print(f"  ✅ Removed unused: {error['variable']}")
    
    print(f"\n✨ Fixed {fixed_count} unused imports/variables")
    print("\nRun 'npm run type-check' to verify remaining errors")

if __name__ == "__main__":
    main()
