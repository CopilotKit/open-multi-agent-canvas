const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Running build process for frontend...');
  execSync('cd frontend && pnpm build', { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname)
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Error running build:', error.message);
  process.exit(1);
}
