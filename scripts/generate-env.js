const fs = require('fs');
const path = require('path');

const envDir = path.join(__dirname, '..', 'src', 'environments');
const exampleFile = path.join(envDir, 'environment.example.ts');
const targetFile = path.join(envDir, 'environment.development.ts');

try {
  if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
  }

  if (!fs.existsSync(exampleFile)) {
    console.warn('environment.example.ts not found; creating a minimal environment.development.ts');
    fs.writeFileSync(
      targetFile,
      "export const environment = { BACKENDBASEURL: 'http://localhost:3000' };\n",
      'utf8'
    );
  } else {
    const content = fs.readFileSync(exampleFile, 'utf8');
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('Generated environment.development.ts from environment.example.ts');
  }
} catch (err) {
  console.error('Failed to generate environment.development.ts', err);
  process.exit(1);
}
