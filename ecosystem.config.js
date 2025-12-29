module.exports = {
  apps: [
    {
      name: "hypomap-frontend",
      script: "npm",
      args: "run preview",
      cwd: "/server/nodejs/hypomap-frontend",
      env: {
        NODE_ENV: "production",
        PORT: "9121",
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      autorestart: true,
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: "10s",
      kill_timeout: 5000,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
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
        "cd hypomap-frontend && npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
    },
  },
};
