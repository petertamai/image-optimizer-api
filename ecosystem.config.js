module.exports = {
    apps: [
      {
        name: 'image-optimizer',
        script: 'src/index.js',
        instances: 'max',
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
          NODE_ENV: 'production',
          PORT: 3000
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: 3000
        },
        env_development: {
          NODE_ENV: 'development',
          PORT: 3001
        },
        // PM2 monitoring configuration
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        // Performance tuning
        node_args: '--max-old-space-size=1024',
        // Garbage collection optimization
        gc_interval: 100, // Force garbage collection every 100 calls
        // Graceful shutdown
        kill_timeout: 3000, // Time in ms to kill the app if it doesn't exit gracefully
        listen_timeout: 3000, // Time in ms before forcing a reload if app not listening
        // Prevent memory leaks
        exp_backoff_restart_delay: 100, // Delay in ms between automatic restarts
        // Handling unexpected termination
        wait_ready: true, // Wait for an explicit ready signal from the application
        // Logging
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        // Cluster management
        increment_var: 'PORT',
        instance_var: 'INSTANCE_ID'
      }
    ]
  };