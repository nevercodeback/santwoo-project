# Deploying a Node.js (Express.js) Backend to Ubuntu Server

This guide walks you through deploying a Node.js backend application (specifically using the Express.js framework) to your configured Ubuntu server. It covers uploading your code, installing dependencies, managing environment variables, and using PM2 to keep your application running.

This guide assumes you have already:
1.  Set up a DigitalOcean Droplet (or any Ubuntu server).
2.  Configured the basic server environment (Node.js, npm, Nginx, MySQL) as detailed in the "Guide to Configuring Server Environment on Ubuntu Droplet".

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Uploading Your Application Code](#uploading-your-application-code)
    *   [Using Git (Recommended)](#using-git-recommended)
    *   [Using `scp` (Linux/macOS) or WinSCP (Windows)](#using-scp-linuxmacos-or-winscp-windows)
3.  [Installing Production Dependencies](#installing-production-dependencies)
4.  [Configuring Environment Variables](#configuring-environment-variables)
    *   [Creating the `.env` File](#creating-the-env-file)
5.  [Setting Up PM2 to Manage Your Application](#setting-up-pm2-to-manage-your-application)
    *   [Installing PM2](#installing-pm2)
    *   [Starting Your Application with PM2](#starting-your-application-with-pm2)
    *   [Monitoring Your Application](#monitoring-your-application)
    *   [Saving PM2 Process List and Configuring Startup on Boot](#saving-pm2-process-list-and-configuring-startup-on-boot)
6.  [Configuring Nginx as a Reverse Proxy](#configuring-nginx-as-a-reverse-proxy)
7.  [Testing Your Deployment](#testing-your-deployment)
8.  [Conclusion](#conclusion)

## 1. Prerequisites

*   An Ubuntu server with Node.js, npm, and Nginx installed.
*   MySQL server installed and configured, with a database and user created for your application (as per the previous guide).
*   Your Node.js (Express.js) application code ready for deployment.
*   SSH access to your server with a `sudo` user.

## 2. Uploading Your Application Code

You need to transfer your application files from your local development machine to your server. Choose one of the following methods:

### 2.1. Using Git (Recommended)

Using Git is the most robust and manageable way to deploy applications. It allows for version control, easy updates, and rollbacks.

1.  **Ensure your code is in a Git repository** (e.g., on GitHub, GitLab, Bitbucket).
2.  **On your server, install Git (if not already installed):**
    ```bash
    sudo apt update
    sudo apt install git -y
    ```
3.  **Clone your repository:**
    Navigate to the directory where you want to store your application (e.g., `/var/www`).
    ```bash
    # Example: create a directory for your apps if it doesn't exist
    sudo mkdir -p /var/www
    cd /var/www

    # Clone your repository
    sudo git clone https://your-git-repository-url.git your-app-name
    ```
    Replace `https://your-git-repository-url.git` with your repository's URL and `your-app-name` with your desired directory name.
    You might need to use SSH keys for private repositories.
4.  **Set permissions (if necessary):**
    The user running your application (or PM2) will need appropriate permissions for this directory. Often, you'll change ownership to your sudo user or a dedicated deployment user.
    ```bash
    sudo chown -R $USER:$USER /var/www/your-app-name
    cd /var/www/your-app-name
    ```
    If Nginx needs to serve static files directly from your app directory, it might also need read access.

**To update your code later:** Navigate to your app directory (`cd /var/www/your-app-name`) and run `git pull`.

### 2.2. Using `scp` (Linux/macOS) or WinSCP (Windows)

This method is suitable for quickly uploading files, especially for smaller projects or if Git is not set up.

**On Linux/macOS (using `scp`):**

Open your local terminal and use `scp` to copy your project directory.
```bash
# Syntax: scp -r /path/to/your/local/app your_user@YOUR_SERVER_IP:/path/to/remote/directory
# Example:
scp -r ~/Projects/my-express-app your_sudo_user@YOUR_DROPLET_IP:/var/www/my-express-app
```
This recursively (`-r`) copies the `my-express-app` directory to `/var/www/my-express-app` on your server. You might need to create `/var/www/my-express-app` on the server first (`sudo mkdir -p /var/www/my-express-app && sudo chown -R your_sudo_user:your_sudo_user /var/www/my-express-app`).

**On Windows (using WinSCP):**

1.  Download and install WinSCP from [https://winscp.net/](https://winscp.net/).
2.  Connect to your server using WinSCP:
    *   **File protocol:** SFTP
    *   **Host name:** `YOUR_DROPLET_IP`
    *   **Port number:** 22
    *   **User name:** Your `sudo` user on the server
    *   You can use password authentication or set up WinSCP to use your SSH private key (recommended).
3.  Once connected, navigate to the desired directory on the server (e.g., `/var/www/`) in the right-hand panel.
4.  Drag and drop your project folder from your local machine (left-hand panel) to the server.
5.  After uploading, connect via SSH and navigate to your application directory:
    ```bash
    cd /var/www/your-app-name
    ```

## 3. Installing Production Dependencies

Once your code is on the server, navigate to its root directory and install only the production dependencies using npm.

```bash
cd /var/www/your-app-name # Or wherever your app is located
npm install --production
```
The `--production` flag ensures that `devDependencies` are not installed, saving space and reducing potential vulnerabilities.

## 4. Configuring Environment Variables

Your application likely needs environment variables for sensitive data like database credentials, API keys, and JWT secrets. **Never hardcode these into your application.**

We'll use a `.env` file to store these variables. The `dotenv` package is commonly used in Node.js applications to load these variables from the file into `process.env`.

1.  **Ensure your application uses `dotenv`:**
    Install it if you haven't: `npm install dotenv` (run this locally and update your `package.json`, then re-upload or `git pull`).
    Load it early in your application's entry point (e.g., `app.js` or `index.js`):
    ```javascript
    require('dotenv').config();
    ```

2.  **Create a `.gitignore` file (if you haven't already) in your project root and add `.env` to it:**
    This prevents your `.env` file (which contains secrets) from being committed to Git.
    ```
    node_modules
    .env
    ```

### 4.1. Creating the `.env` File on the Server

In your application's root directory on the server (`/var/www/your-app-name`), create a `.env` file:

```bash
cd /var/www/your-app-name
sudo nano .env
```

Add your environment-specific configurations. For example:

```ini
# Database Configuration
DB_HOST=localhost
DB_USER=myapp_user        # The MySQL user you created
DB_PASSWORD=your_strong_mysql_password # The password for myapp_user
DB_NAME=myapp_db          # The MySQL database you created
DB_PORT=3306

# Application Configuration
PORT=3000                 # The port your Node.js app will listen on (internally)
NODE_ENV=production

# Security
JWT_SECRET=your_super_secret_and_long_jwt_string # Make this long and random

# Other API keys or settings
# API_KEY_SERVICE_X=xxxxxxxxxxxxxxx
```

*   Replace placeholder values with your actual credentials and settings.
*   `PORT`: This is the port your Node.js application will listen on. Nginx will typically proxy requests from public port 80 (HTTP) or 443 (HTTPS) to this internal port.
*   `NODE_ENV=production`: Important for performance and disabling debug features in many frameworks like Express.

Save the file (Ctrl+X, then Y, then Enter in `nano`).

**Important:** Ensure this `.env` file is readable by the user running your application, but not publicly accessible. Standard file permissions set by `sudo nano` are usually fine.

## 5. Setting Up PM2 to Manage Your Application

PM2 is a powerful process manager for Node.js applications. It keeps your app alive, facilitates clustering, manages logs, and helps with startup scripts.

### 5.1. Installing PM2

Install PM2 globally using npm:

```bash
sudo npm install pm2 -g
```

### 5.2. Starting Your Application with PM2

Navigate to your application's root directory. Start your application using PM2. Replace `app.js` with the name of your application's entry point file.

```bash
cd /var/www/your-app-name
pm2 start app.js --name "my-app-name"
```
*   `app.js`: Your application's main file.
*   `--name "my-app-name"`: Assigns a descriptive name to your process in PM2. Choose a memorable name.

PM2 will now run your application in the background.

**If your `package.json` has a start script (e.g., `"start": "node index.js"`):**
You can also start your app using the npm script:
```bash
pm2 start npm --name "my-app-name" -- run start
```

### 5.3. Monitoring Your Application

*   **List all running processes managed by PM2:**
    ```bash
    pm2 list
    ```
*   **View logs for a specific application:**
    ```bash
    pm2 logs my-app-name
    ```
    (Use `pm2 logs` to see logs for all apps).
*   **Monitor CPU and memory usage:**
    ```bash
    pm2 monit
    ```
*   **Show details for a specific process:**
    ```bash
    pm2 show my-app-name
    ```
*   **Restart, Stop, Delete an application:**
    ```bash
    pm2 restart my-app-name
    pm2 stop my-app-name
    pm2 delete my-app-name
    ```

### 5.4. Saving PM2 Process List and Configuring Startup on Boot

To ensure your application restarts automatically if the server reboots:

1.  **Save your current PM2 process list:**
    ```bash
    pm2 save
    ```
2.  **Generate and configure a startup script:**
    PM2 will detect your system's `init` system (like `systemd` on modern Ubuntu) and provide you with a command to run.

    ```bash
    pm2 startup
    ```
    This command will output another command that you need to copy and run with `sudo` privileges. It will look something like:
    `sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u your_user --hp /home/your_user`

    **Run the command provided by `pm2 startup`.** This registers PM2 as a service that will start on boot.

## 6. Configuring Nginx as a Reverse Proxy

Your Node.js application is likely running on an internal port (e.g., 3000, as set in your `.env` file). Nginx should be configured to act as a reverse proxy, listening on public port 80 (HTTP) and/or 443 (HTTPS) and forwarding requests to your Node.js application.

We covered the basics of this in the "Guide to Configuring Server Environment on Ubuntu Droplet" (Section 7). You'll need to:

1.  Ensure your Node.js application (managed by PM2) is running and listening on the port specified in your `.env` file (e.g., `PORT=3000`).
2.  Create or modify an Nginx server block configuration file in `/etc/nginx/sites-available/` for your application.
3.  The `proxy_pass` directive in your Nginx configuration should point to the address and port your Node.js app is listening on (e.g., `http://localhost:3000`).

   Example snippet for `/etc/nginx/sites-available/your-app-name`:
   ```nginx
   server {
       listen 80;
       server_name your_domain.com www.your_domain.com YOUR_DROPLET_IP; # Replace with your actual domain/IP

       location / {
           proxy_pass http://localhost:3000; # Or whatever port your app uses
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
4.  Enable the site: `sudo ln -s /etc/nginx/sites-available/your-app-name /etc/nginx/sites-enabled/`
5.  Test Nginx configuration: `sudo nginx -t`
6.  Reload Nginx: `sudo systemctl reload nginx`

## 7. Testing Your Deployment

Open your web browser and navigate to your server's IP address or your configured domain name. You should see your Node.js application responding.

Check PM2 logs (`pm2 logs my-app-name`) and Nginx error logs (`/var/log/nginx/error.log`) if you encounter issues.

## 8. Conclusion

You have successfully deployed your Node.js (Express.js) backend to your Ubuntu server using PM2 for process management and (presumably) Nginx as a reverse proxy. This setup provides a robust foundation for running your application.

Key takeaways:
*   Use Git for code management and updates.
*   Securely manage configuration using `.env` files (and keep them out of Git).
*   PM2 is essential for keeping your application alive and managing it in production.
*   Nginx handles incoming public traffic and efficiently forwards it to your application.

Remember to set up HTTPS with SSL certificates (e.g., using Let's Encrypt with Certbot) for any production application to secure data in transit. This would typically involve updating your Nginx configuration.
```
