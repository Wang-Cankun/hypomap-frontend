module.exports = {
  apps: [
    {
      name: "hypomap-frontend",
      script: "./start.sh",
      interpreter: "/bin/bash",
      cwd: "/server/nodejs/hypomap-frontend",
      env: {
        NODE_ENV: "production",
        PORT: 9121,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      // Logs
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Restart behavior
      exp_backoff_restart_delay: 100,
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: "10s",
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: false,
      listen_timeout: 10000,
    },
  ],

  deploy: {
    production: {
      user: "wan268",
      host: "bmblx.bmi.osumc.edu",
      ref: "origin/main",
      repo: "git@github.com:Wang-Cankun/hypomap-frontend.git",
      path: "/server/nodejs",
      "pre-deploy-local": "",
      "post-deploy":
        "cd hypomap-frontend && npm install && npm run build && pm2 reload ecosystem.config.cjs --env production",
      "pre-setup": "",
    },
  },
};
