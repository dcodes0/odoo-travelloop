const REQUIRED = ['DATABASE_URL', 'SESSION_SECRET'];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    throw new Error(
      `[env] Required environment variable "${key}" is not set.\n` +
      `Copy .env.example to .env.local and fill in all values.`
    );
  }
}

if (process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    '[env] SESSION_SECRET must be at least 32 characters. ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}
