module.exports = {
  apps: [
    {
      name: "sskind-frontend",
      // Use bash script that loads nvm and correct Node version
      script: "./start.sh",
      cwd: "./",
      interpreter: "/bin/bash",
      env: {
        NODE_ENV: "production",
        PORT: 9118,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
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
};
