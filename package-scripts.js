// Alternative startup script for Windows without tsx
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.VITE_LOCAL = 'true';
process.env.DATABASE_URL = '';
process.env.PORT = '5000';

console.log('Starting AI Story Builder in Development Mode...');
console.log('Environment:', process.env.NODE_ENV);
console.log('VITE_LOCAL:', process.env.VITE_LOCAL);
console.log('Port:', process.env.PORT);
console.log('');

// Start the server
const serverPath = path.join(__dirname, 'server', 'index.ts');

// Try different approaches to run TypeScript
const commands = [
  { cmd: 'npx', args: ['tsx', serverPath] },
  { cmd: 'npx', args: ['ts-node', serverPath] },
  { cmd: 'node', args: ['--loader', 'tsx/esm', serverPath] }
];

let currentAttempt = 0;

function tryStartServer() {
  if (currentAttempt >= commands.length) {
    console.error('All startup methods failed. Please run: npm run build && node dist/index.js');
    process.exit(1);
  }

  const { cmd, args } = commands[currentAttempt];
  console.log(`Attempt ${currentAttempt + 1}: ${cmd} ${args.join(' ')}`);

  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    console.log(`Method ${currentAttempt + 1} failed:`, error.message);
    currentAttempt++;
    setTimeout(tryStartServer, 1000);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log(`Method ${currentAttempt + 1} exited with code ${code}`);
      currentAttempt++;
      setTimeout(tryStartServer, 1000);
    }
  });
}

tryStartServer();