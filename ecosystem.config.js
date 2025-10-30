module.exports = {
  apps: [
    {
      name: 'complai-frontend',
      script: 'pnpm',
      args: 'start',
      cwd: '/var/www/complai-frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_BACKEND_URL: 'https://api.compl-ai.co.uk',
      },
      error_file: '/var/www/complai-frontend/logs/pm2-error.log',
      out_file: '/var/www/complai-frontend/logs/pm2-out.log',
      log_file: '/var/www/complai-frontend/logs/pm2-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};

