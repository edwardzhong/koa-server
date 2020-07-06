module.exports = {
  apps: [
    {
      name: 'koa server',
      script: './dist/app.js',
      watch: ['dist'],
      log_date_format: 'YYYY - MM - DD HH: mm Z',
      instances: 'max',
      error_file: './logs/app_err.log',
      out_file: './logs/app_out.log',
      merge_logs: true,
      exec_mode: 'cluster',
      max_memory_restart: '100M',
      env: {
        PORT: 3000,
        NODE_ENV: 'development',
      },
      env_production: {
        PORT: 3100,
        NODE_ENV: 'production',
      },
    }
  ]
};
