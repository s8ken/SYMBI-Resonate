import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPaths = [path.resolve('.env'), path.resolve('.env.demo')];
const existingEnvPath = envPaths.find((filePath) => fs.existsSync(filePath));

if (!existingEnvPath) {
  console.error('No .env or .env.demo found. Copy .env.demo to .env to enable the demo preset.');
  process.exit(1);
}

const rawEnv = fs.readFileSync(existingEnvPath);
const envVars = dotenv.parse(rawEnv);

const requiredKeys = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const optionalKeys = ['SUPABASE_SERVICE_ROLE_KEY'];

const errors: string[] = [];
const warnings: string[] = [];
const demoModeValue = envVars['DEMO_MODE'];
const isDemoMode = demoModeValue === 'true';

function requireKey(key: string) {
  const value = envVars[key];
  if (!value || value.trim().length === 0) {
    errors.push(`${key} is missing in ${path.basename(existingEnvPath)}.`);
    return;
  }

  if (value.includes('your_supabase')) {
    errors.push(`${key} still uses the placeholder value (your_supabase_*). Replace it with a real key.`);
    return;
  }

  if (key.includes('URL')) {
    const isSupabaseDomain = /supabase\.(co|net)/.test(value);
    const isLocalhost = value.startsWith('http://localhost');
    if (!isSupabaseDomain && !isLocalhost) {
      warnings.push(`${key} is set but does not look like a Supabase URL. Double-check the value: ${value}`);
    }
  }

  if (key.includes('KEY') && value.length < 40 && !isDemoMode) {
    warnings.push(`${key} looks too short to be a valid Supabase key.`);
  }
}

function compareKeys(left: string, right: string) {
  const leftVal = envVars[left];
  const rightVal = envVars[right];
  if (leftVal && rightVal && leftVal !== rightVal) {
    warnings.push(`${left} and ${right} differ. The frontend and edge function should point at the same Supabase project.`);
  }
}

requiredKeys.forEach(requireKey);
optionalKeys.forEach((key) => {
  if (envVars[key]) {
    requireKey(key);
  }
});

compareKeys('VITE_SUPABASE_URL', 'SUPABASE_URL');
compareKeys('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');

if (demoModeValue === 'true') {
  warnings.push('DEMO_MODE is enabled. Auth is bypassed for local walkthroughs only.');
} else if (demoModeValue === 'false') {
  warnings.push('DEMO_MODE is disabled. Ensure you pass a valid Supabase JWT in the Authorization header for protected routes.');
} else {
  warnings.push('DEMO_MODE is not set. Defaulting to disabled; set DEMO_MODE=true for the guided demo preset.');
}

if (errors.length > 0) {
  console.error(`\n❌ Demo env validation failed for ${path.basename(existingEnvPath)}:`);
  errors.forEach((error) => console.error(` - ${error}`));
}

if (warnings.length > 0) {
  console.warn(`\n⚠️  Notices:`);
  warnings.forEach((warning) => console.warn(` - ${warning}`));
}

if (errors.length === 0) {
  console.log(`✅ ${path.basename(existingEnvPath)} is ready for the demo walkthrough.`);
}

if (errors.length > 0) {
  process.exit(1);
}
