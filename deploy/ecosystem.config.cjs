module.exports = {
  apps: [
    {
      name: "nashawi-tel",
      cwd: "/var/www/nashawi-tel",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H 127.0.0.1",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        DATA_DIR: "/var/lib/nashawi-tel",
      },
      env_file: "/var/www/nashawi-tel/.env.production",
    },
  ],
};
