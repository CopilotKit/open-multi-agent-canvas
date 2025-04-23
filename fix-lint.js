const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running ESLint fix on frontend...');
  execSync('cd frontend && npx eslint --fix "src/**/*.{ts,tsx}"', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname)
  });
  console.log('ESLint fix completed successfully!');
} catch (error) {
  console.error('Error running ESLint fix:', error.message);
  process.exit(1);
}
