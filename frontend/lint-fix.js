const { execSync } = require('child_process');
const path = require('path');

// Run ESLint on all TypeScript and TypeScript React files
try {
  console.log('Running ESLint on all TypeScript files...');
  execSync('npx eslint --fix "src/**/*.{ts,tsx}"', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname)
  });
  console.log('ESLint completed successfully!');
} catch (error) {
  console.error('Error running ESLint:', error.message);
  process.exit(1);
}
