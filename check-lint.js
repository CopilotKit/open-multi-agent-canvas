const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running ESLint check on frontend...');
  execSync('cd frontend && pnpm lint', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname)
  });
  console.log('ESLint completed successfully!');
} catch (error) {
  console.error('Error running ESLint:', error.message);
  process.exit(1);
}
