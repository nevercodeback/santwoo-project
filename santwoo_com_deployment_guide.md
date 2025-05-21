# Full Stack Deployment Guide for santwoo.com on DigitalOcean

This comprehensive guide provides a step-by-step walkthrough for deploying a full-stack web application, using `santwoo.com` as the example domain, on a DigitalOcean Ubuntu Droplet. We will cover everything from initial server setup to application deployment, DNS configuration, SSL/TLS encryption, and final testing.

This document combines several detailed guides into one cohesive flow:
1.  Setting up your DigitalOcean Droplet.
2.  Configuring the server environment (Node.js, Nginx, MySQL).
3.  Deploying a Node.js backend application.
4.  Deploying static frontend files (including Tailwind CSS considerations).
5.  Configuring DNS for `santwoo.com`.
6.  Securing `santwoo.com` with SSL/TLS using Certbot.
7.  Final testing and troubleshooting common issues.

Follow these parts sequentially to take your project from development to a live, secure production environment.

## Main Table of Contents

*   [Part 1: DigitalOcean Droplet Setup](#part-1-digitalocean-droplet-setup)
*   [Part 2: Server Environment Configuration on Ubuntu](#part-2-server-environment-configuration-on-ubuntu)
*   [Part 3: Deploying a Node.js (Express.js) Backend](#part-3-deploying-a-nodejs-expressjs-backend)
*   [Part 4: Deploying Static Frontend Files with Nginx](#part-4-deploying-static-frontend-files-with-nginx)
*   [Part 5: Configuring DNS for `santwoo.com`](#part-5-configuring-dns-for-santwoocom)
*   [Part 6: Setting Up SSL/TLS with Certbot for `santwoo.com`](#part-6-setting-up-ssltls-with-certbot-for-santwoocom)
*   [Part 7: Final Testing and Troubleshooting](#part-7-final-testing-and-troubleshooting)

---

## Part 1: DigitalOcean Droplet Setup

This part will walk you through the process of creating and configuring a DigitalOcean Droplet, focusing on secure access using SSH keys. We'll cover choosing the right plan, selecting Ubuntu as your operating system, and connecting via SSH.

### 1.1. Choosing a Droplet Plan

DigitalOcean offers various Droplet plans tailored to different needs. Consider the following when choosing a plan:

*   **CPU:** How much processing power do you need? For simple websites or development environments, a shared CPU (Basic Droplets) might be sufficient. For production applications or CPU-intensive tasks, consider Dedicated CPU options.
*   **RAM:** Memory is crucial for running applications smoothly. The amount of RAM needed depends on your workload (e.g., databases, web servers with high traffic).
*   **Storage (SSD):** All Droplets come with fast SSD storage. Choose a size that accommodates your OS, applications, and data.
*   **Transfer:** This is the amount of outbound data transfer allowed per month. Inbound traffic is free.

**Recommendation for Beginners:** Start with a basic, low-cost plan. You can always resize your Droplet later if you need more resources. The "$5/mo" or "$6/mo" plans are often a good starting point for learning and small projects.

### 1.2. Selecting an Operating System

For this guide, we will use **Ubuntu**. DigitalOcean typically offers the latest LTS (Long Term Support) versions of Ubuntu, which are recommended for stability and extended support.

When creating your Droplet, you'll be presented with a choice of distributions. Select the latest Ubuntu LTS version available.

### 1.3. Setting Up SSH Keys

SSH (Secure Shell) keys provide a more secure way of logging into your server compared to using passwords. They consist of a private key (kept secret on your computer) and a public key (placed on the server).

#### 1.3.1. Generating SSH Keys

**On Linux/macOS:**

1.  Open your terminal.
2.  Run the following command:
    ```bash
    ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
    ```
    *   `-t rsa`: Specifies the RSA algorithm.
    *   `-b 4096`: Specifies a key length of 4096 bits (very secure).
    *   `-C "your_email@example.com"`: A comment to help you identify the key.
3.  You'll be prompted to enter a file in which to save the key. The default (`~/.ssh/id_rsa`) is usually fine. Press Enter.
4.  You'll be asked to enter a passphrase. **This is highly recommended!** A passphrase adds an extra layer of security to your private key. Make it strong and memorable.
5.  Your public key will be saved as `~/.ssh/id_rsa.pub`, and your private key as `~/.ssh/id_rsa`.

**On Windows (using PuTTYgen, covered later, or Windows Subsystem for Linux - WSL):**

If you have WSL, you can follow the Linux/macOS instructions above. Alternatively, PuTTY comes with a tool called PuTTYgen that can generate keys. We will cover this in the [Connecting from Windows using PuTTY](#152-connecting-from-windows-using-putty) subsection. It's often easier to generate the key pair on your local machine first.

#### 1.3.2. Adding Your Public SSH Key to DigitalOcean

Before creating your Droplet (or during the creation process), you need to add your **public** SSH key to your DigitalOcean account.

1.  Log in to your DigitalOcean account.
2.  In the main menu, navigate to **Settings**, then click on the **Security** tab.
3.  In the "SSH Keys" section, click **Add SSH Key**.
4.  **Copy the contents of your public key file.**
    *   On Linux/macOS, you can display it with: `cat ~/.ssh/id_rsa.pub`
    *   Copy the entire output, starting with `ssh-rsa` and ending with your email comment.
5.  Paste the copied public key into the "SSH Key Content" field on DigitalOcean.
6.  Give your SSH key a recognizable **Name** (e.g., "My Laptop Key", "Workstation Key").
7.  Click **Add SSH Key**.

### 1.4. Creating Your Droplet

Now you're ready to create your Droplet:

1.  From your DigitalOcean dashboard, click the **Create** button and select **Droplets**.
2.  **Choose an image:**
    *   **Distribution:** Select the latest **Ubuntu LTS** version (e.g., 22.04 LTS).
3.  **Choose a plan:** Select the plan that fits your needs, as discussed in section 1.1.
4.  **Choose a datacenter region:** Pick a region geographically close to you or your target audience for lower latency.
5.  **Authentication:** This is a crucial step.
    *   Select **SSH Keys**.
    *   You should see the SSH key(s) you added to your account. Check the box next to the key you want to use for this Droplet.
    *   **It is highly recommended to disable password authentication.** If you only select SSH keys, password login for the root user will typically be disabled by default, which is good for security.
6.  **Select additional options (optional):**
    *   **Monitoring:** Basic monitoring is free and recommended.
    *   **User data:** For advanced configurations at launch.
7.  **Finalize and create:**
    *   Choose a **Hostname** for your Droplet (e.g., `santwoo-com-droplet`).
    *   Add tags if you use them for organization.
    *   Click **Create Droplet**.

Your Droplet will now be provisioned, which usually takes less than a minute. Once it's ready, you'll see its IP address on your dashboard.

### 1.5. Connecting to Your Droplet via SSH

You'll need the Droplet's IP address and the private SSH key that corresponds to the public key you added.

#### 1.5.1. Connecting from Linux/macOS

1.  Open your terminal.
2.  Use the following command:
    ```bash
    ssh root@YOUR_DROPLET_IP
    ```
    Replace `YOUR_DROPLET_IP` with the actual IP address of your Droplet.
3.  If you set a passphrase for your SSH key, you'll be prompted to enter it.
4.  The first time you connect, you might see a message about the authenticity of the host. Type `yes` to continue.

You should now be logged into your Droplet as the `root` user.

#### 1.5.2. Connecting from Windows using PuTTY

PuTTY is a popular free SSH client for Windows.

##### 1.5.2.1. Downloading and Installing PuTTY

1.  Go to the official PuTTY download page: [https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
2.  Download the PuTTY installer (e.g., `putty-64bit-X.XX-installer.msi`). You'll also need **PuTTYgen** (`puttygen.exe`) for converting keys if you generated your key in OpenSSH format.
3.  Run the installer and follow the on-screen instructions.

##### 1.5.2.2. Converting Your Private Key with PuTTYgen

If you generated your SSH key using `ssh-keygen` (OpenSSH format, common on Linux/macOS/WSL), you need to convert your **private key** to PuTTY's `.ppk` (PuTTY Private Key) format.

1.  Open **PuTTYgen** (it should be installed with PuTTY).
2.  Click the **Load** button.
3.  By default, PuTTYgen looks for `.ppk` files. Change the file type filter to "All Files (*.*)".
4.  Navigate to where your private key is stored (e.g., `C:\Users\YourUser\.ssh\id_rsa` or wherever you saved it if you used WSL: `\\wsl$\Ubuntu\home\youruser\.ssh\id_rsa`). Select your **private** key (e.g., `id_rsa`, not `id_rsa.pub`).
5.  If you set a passphrase when generating the key, you'll be prompted to enter it now.
6.  Once loaded, click **Save private key**.
7.  Choose a location to save your new `.ppk` file (e.g., in a secure folder).
8.  You'll be asked if you want to save it without a passphrase. If your original key had a passphrase, it's recommended to use one here as well for the `.ppk` file.

**If you generated your key pair directly with PuTTYgen:**

1.  Open PuTTYgen.
2.  Click **Generate**. Move your mouse around the blank area to generate randomness.
3.  Once generated, you'll see the public key. Copy this and add it to DigitalOcean as described in section 1.3.2.
4.  Enter a **Key passphrase** and confirm it (recommended).
5.  Click **Save private key** and store the `.ppk` file securely.
6.  Click **Save public key** and store it for your records (though the main one you'll paste to DigitalOcean is directly from the PuTTYgen window).

##### 1.5.2.3. Configuring PuTTY for Connection

1.  Open **PuTTY**.
2.  **Session Category (default view):**
    *   **Host Name (or IP address):** Enter `root@YOUR_DROPLET_IP` (replace `YOUR_DROPLET_IP` with your Droplet's IP).
    *   **Port:** `22` (default for SSH).
    *   **Connection type:** SSH.
    *   You can save this session for later use: type a name in "Saved Sessions" (e.g., "My DO Droplet") and click **Save**.
3.  **Connection > SSH > Auth Category:**
    *   Click the **Browse...** button under "Private key file for authentication".
    *   Select the `.ppk` file you saved earlier.
4.  **(Optional but Recommended) KeepAlive:** To prevent your SSH session from disconnecting due to inactivity:
    *   Go to **Connection** category.
    *   Set "Seconds between keepalives (0 to turn off)" to a value like `60`.
5.  Click **Open** to start the SSH session.
6.  If you set a passphrase for your `.ppk` file, you'll be prompted to enter it.
7.  The first time you connect, you might see a security alert about the server's host key not being cached. Click **Yes** to trust the host and cache the key.

You should now be logged into your Droplet as `root`.

### 1.6. Initial Server Setup (Recommended)

Logging in as `root` is powerful but risky for everyday tasks. It's highly recommended to perform an initial server setup, which includes:

*   Creating a new non-root user with `sudo` privileges.
*   Configuring SSH to use this new user.
*   Disabling root login via SSH (if not already disabled by default with key-only auth).
*   Setting up a basic firewall (e.g., UFW).

DigitalOcean has excellent tutorials on initial server setup for Ubuntu. Search for "Initial Server Setup with Ubuntu [your version]" on their community site. **It is strongly advised to complete this initial server setup before proceeding to Part 2.**

### 1.7. Conclusion of Part 1

You have now successfully set up a DigitalOcean Droplet with Ubuntu, configured SSH key authentication for secure access. Remember to keep your private key secure and follow best practices for server management. For further steps, explore DigitalOcean's documentation and community tutorials to learn how to install software, configure your web server, and deploy your applications.

---

## Part 2: Server Environment Configuration on Ubuntu

This part details the steps to set up a common server environment on your Ubuntu Droplet, including Node.js, npm, MySQL Server, and Nginx. This assumes you have completed Part 1 and can connect to your Droplet via SSH (preferably as a non-root sudo user as recommended in section 1.6).

### 2.1. Prerequisites for Part 2

*   An Ubuntu Droplet set up as per Part 1.
*   You are connected to your Droplet via SSH as a user with `sudo` privileges.
*   Basic familiarity with Linux command line.

### 2.2. Updating Your System

Before installing any new software, it's crucial to update your server's package list and upgrade existing packages.

```bash
sudo apt update
sudo apt upgrade -y
```
Answer `yes` (or use the `-y` flag as shown) if prompted to continue.

### 2.3. Installing Node.js and npm

We'll install Node.js using the NodeSource repository, which provides more up-to-date versions than the default Ubuntu repositories.

1.  **Download and run the NodeSource setup script.**
    Replace `18.x` with the version you need (e.g., `20.x` for Node.js 20, `16.x` for Node.js 16). Check the NodeSource GitHub repository for currently supported versions.

    ```bash
    # Example for Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    ```

2.  **Install Node.js and npm.**
    npm (Node Package Manager) is included with Node.js.

    ```bash
    sudo apt-get install -y nodejs
    ```

3.  **Verify the installation.**

    ```bash
    node -v
    npm -v
    ```
    These commands should output the installed versions of Node.js and npm, respectively.

4.  **(Optional) Install build tools.**
    Some npm packages may require compiling code from source. It's good to have the necessary build tools installed.

    ```bash
    sudo apt-get install -y build-essential
    ```

### 2.4. Installing MySQL Server

MySQL is a popular open-source relational database management system.

1.  **Install the MySQL Server package.**

    ```bash
    sudo apt-get install -y mysql-server
    ```

2.  **Check MySQL service status.**
    It should start automatically after installation.

    ```bash
    sudo systemctl status mysql
    ```
    Press `q` to exit the status view. If it's not active, you can try starting it with `sudo systemctl start mysql`.

#### 2.4.1. Running `mysql_secure_installation`

This script helps you improve the security of your MySQL installation by:
*   Setting a root password (if not set during installation).
*   Removing anonymous users.
*   Disallowing root login remotely.
*   Removing the test database.

1.  **Run the security script.**

    ```bash
    sudo mysql_secure_installation
    ```

2.  **Follow the prompts:**
    *   **VALIDATE PASSWORD COMPONENT:** You can choose to enable this for stronger password policies. If enabled, choose a password strength level.
    *   **Set root password:** If prompted, set a strong password for the MySQL `root` user. Remember this password!
    *   **Remove anonymous users?** Answer `Y` (yes).
    *   **Disallow root login remotely?** Answer `Y` (yes). This is crucial for security.
    *   **Remove test database and access to it?** Answer `Y` (yes).
    *   **Reload privilege tables now?** Answer `Y` (yes).

### 2.5. Creating a MySQL Database and User for `santwoo.com`

It's a best practice to create a dedicated database and user for each application instead of using the MySQL `root` user. We'll use `santwoo_db` and `santwoo_user` for our example application `santwoo.com`.

1.  **Log in to the MySQL prompt as the `root` user.**
    You'll be prompted for the MySQL `root` password you set during `mysql_secure_installation`.

    ```bash
    sudo mysql -u root -p
    ```

2.  **Create a new database for `santwoo.com`.**

    ```sql
    CREATE DATABASE santwoo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
    Using `utf8mb4` is recommended for full Unicode support.

3.  **Create a new MySQL user and set a password.**
    Replace `your_strong_password` with a strong, unique password for this user.
    Using `localhost` means this user can only connect from the local machine (the Droplet itself), which is more secure.

    ```sql
    CREATE USER 'santwoo_user'@'localhost' IDENTIFIED BY 'your_strong_password';
    ```

4.  **Grant privileges to the new user on the database.**
    This gives `santwoo_user` all standard privileges on the `santwoo_db` database.

    ```sql
    GRANT ALL PRIVILEGES ON santwoo_db.* TO 'santwoo_user'@'localhost';
    ```

5.  **Flush privileges** to apply the changes.

    ```sql
    FLUSH PRIVILEGES;
    ```

6.  **Exit the MySQL prompt.**

    ```sql
    EXIT;
    ```

You now have a database (`santwoo_db`) and a user (`santwoo_user`) ready for your `santwoo.com` application. Store the password securely.

### 2.6. Installing Nginx

Nginx is a high-performance web server that can also be used as a reverse proxy, load balancer, and HTTP cache.

1.  **Install Nginx.**

    ```bash
    sudo apt-get install -y nginx
    ```

2.  **Adjust the firewall (if using UFW).**
    If you have UFW (Uncomplicated Firewall) enabled (recommended in Part 1's initial server setup), you'll need to allow traffic to Nginx.
    *   To see available application profiles for UFW: `sudo ufw app list`
    *   Nginx creates a few profiles:
        *   `Nginx HTTP`: Allows traffic on port 80 (standard HTTP).
        *   `Nginx HTTPS`: Allows traffic on port 443 (standard HTTPS).
        *   `Nginx Full`: Allows traffic on both ports 80 and 443.

    Choose the appropriate profile. For now, let's allow HTTP, as HTTPS will be configured in a later part.

    ```bash
    sudo ufw allow 'Nginx HTTP'
    # If you plan to set up SSL/TLS later (Part 6), you'll eventually need 'Nginx Full' or 'Nginx HTTPS'.
    # sudo ufw allow 'Nginx Full'
    ```
    Ensure your firewall is enabled: `sudo ufw enable` (if not already).

3.  **Check Nginx service status.**

    ```bash
    sudo systemctl status nginx
    ```
    Press `q` to exit. If it's not active, you can try starting it with `sudo systemctl start nginx`.

4.  **Verify Nginx installation.**
    Open a web browser and navigate to your Droplet's IP address (`http://YOUR_DROPLET_IP`). You should see the default Nginx welcome page.

### 2.7. Next Steps: Configuring Nginx as a Reverse Proxy (Brief Overview)

If you're running a Node.js application (as we will in Part 3), you'll typically use Nginx as a reverse proxy. This means Nginx listens for public HTTP(S) requests and forwards them to your application server.

This involves:
1.  Running your Node.js application on a specific port (e.g., `localhost:3000`).
2.  Creating an Nginx server block for `santwoo.com` that proxies requests to your Node.js application.

Detailed Nginx configuration for the backend and frontend will be covered in Parts 3 and 4.

### 2.8. Conclusion of Part 2

You have now installed and configured key components for a modern web application server: Node.js and npm for your application runtime, MySQL for database storage (with a dedicated user and database for `santwoo.com`), and Nginx as a web server. Your Ubuntu Droplet is now well-equipped to host dynamic web applications.

---

## Part 3: Deploying a Node.js (Express.js) Backend

This part walks you through deploying a Node.js backend application (specifically using the Express.js framework) for `santwoo.com` to your configured Ubuntu server. It covers uploading your code, installing dependencies, managing environment variables, and using PM2 to keep your application running.

### 3.1. Prerequisites for Part 3

*   An Ubuntu server with Node.js, npm, Nginx, and MySQL installed and configured as per Part 2.
*   A database (`santwoo_db`) and user (`santwoo_user`) created for your application.
*   Your Node.js (Express.js) application code ready for deployment.
*   SSH access to your server with a `sudo` user.

### 3.2. Uploading Your Application Code

You need to transfer your application files from your local development machine to your server. Choose one of the following methods:

#### 3.2.1. Using Git (Recommended)

1.  **Ensure your code is in a Git repository** (e.g., on GitHub, GitLab, Bitbucket).
2.  **On your server, install Git (if not already installed from Part 2):**
    ```bash
    sudo apt update
    sudo apt install git -y
    ```
3.  **Clone your repository:**
    Navigate to the directory where you want to store your application. For `santwoo.com`, we'll use `/var/www/santwoo.com/backend`.
    ```bash
    sudo mkdir -p /var/www/santwoo.com/backend
    cd /var/www/santwoo.com

    # Clone your repository into the 'backend' directory
    sudo git clone https://your-git-repository-url.git backend
    ```
    Replace `https://your-git-repository-url.git` with your repository's URL.
4.  **Set permissions:**
    The user running your application (PM2) will need appropriate permissions.
    ```bash
    sudo chown -R $USER:$USER /var/www/santwoo.com/backend
    cd /var/www/santwoo.com/backend
    ```

**To update your code later:** Navigate to your app directory (`cd /var/www/santwoo.com/backend`) and run `git pull`.

#### 3.2.2. Using `scp` (Linux/macOS) or WinSCP (Windows)

Alternatively, upload your files directly.
**On Linux/macOS (using `scp`):**
```bash
# Example:
scp -r ~/Projects/santwoo-backend/* your_sudo_user@YOUR_DROPLET_IP:/var/www/santwoo.com/backend/
```
**On Windows (using WinSCP):**
Connect to your server and drag your project files to `/var/www/santwoo.com/backend/`.

### 3.3. Installing Production Dependencies

Once your code is on the server, navigate to its root directory (`/var/www/santwoo.com/backend`) and install only the production dependencies.

```bash
cd /var/www/santwoo.com/backend
npm install --production
```

### 3.4. Configuring Environment Variables

Use a `.env` file to store sensitive data. Ensure your application uses the `dotenv` package.

1.  **Add `.env` to your project's `.gitignore` file locally and commit.**
2.  **Create the `.env` file on the server:**
    ```bash
    cd /var/www/santwoo.com/backend
    sudo nano .env
    ```
    Add your environment-specific configurations. For `santwoo.com`:
    ```ini
    # Database Configuration for santwoo.com
    DB_HOST=localhost
    DB_USER=santwoo_user
    DB_PASSWORD=your_strong_mysql_password_for_santwoo_user
    DB_NAME=santwoo_db
    DB_PORT=3306

    # Application Configuration
    PORT=3000                 # Internal port for Node.js app
    NODE_ENV=production

    # Security
    JWT_SECRET=your_super_secret_and_long_jwt_string_for_santwoo

    # Other API keys or settings for santwoo.com
    ```
    Replace placeholders. Save the file.

### 3.5. Setting Up PM2 to Manage Your Application

PM2 is a process manager for Node.js.

#### 3.5.1. Installing PM2

```bash
sudo npm install pm2 -g
```

#### 3.5.2. Starting Your Application with PM2

Navigate to your application's root directory (`/var/www/santwoo.com/backend`). Replace `app.js` with your application's entry point file.

```bash
cd /var/www/santwoo.com/backend
pm2 start app.js --name "santwoo-backend"
```
Or, if using an npm start script: `pm2 start npm --name "santwoo-backend" -- run start`

#### 3.5.3. Monitoring Your Application

*   List processes: `pm2 list`
*   View logs: `pm2 logs santwoo-backend`
*   Monitor CPU/memory: `pm2 monit`

#### 3.5.4. Saving PM2 Process List and Configuring Startup on Boot

1.  Save process list: `pm2 save`
2.  Generate startup script:
    ```bash
    pm2 startup
    ```
    Copy and run the command outputted by `pm2 startup` (it will include `sudo`).

### 3.6. Configuring Nginx as a Reverse Proxy for the Backend

Nginx will forward requests from the public internet to your Node.js application.

1.  **Create/Edit Nginx server block for `santwoo.com`:**
    The Nginx configuration will be more comprehensively set up in Part 6 when SSL is added. For now, ensure a basic block exists or create one for initial testing if needed. A more complete configuration that handles both backend and frontend will be refined.

    A temporary or initial Nginx configuration for `santwoo.com` might look like this (e.g., in `/etc/nginx/sites-available/santwoo.com`):
    ```nginx
    server {
        listen 80;
        server_name santwoo.com www.santwoo.com; # Will be updated in Part 6

        location /api { # Assuming your backend API routes are prefixed with /api
            proxy_pass http://localhost:3000; # Points to your Node.js app
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Placeholder for frontend - will be configured in Part 4
        # location / {
        #     root /var/www/santwoo.com/frontend; # Example path
        #     index index.html;
        # }
    }
    ```
2.  **Enable the site (if newly created):**
    ```bash
    sudo ln -s /etc/nginx/sites-available/santwoo.com /etc/nginx/sites-enabled/
    ```
3.  Test Nginx configuration: `sudo nginx -t`
4.  Reload Nginx: `sudo systemctl reload nginx`

**Note:** This Nginx config is basic. We will build upon it in Part 4 (Frontend) and Part 6 (SSL).

### 3.7. Testing Your Backend Deployment

You can test your backend API endpoints using a tool like `curl` from your server or Postman from your local machine, targeting `http://YOUR_DROPLET_IP/api/your-endpoint`.

### 3.8. Conclusion of Part 3

Your Node.js backend for `santwoo.com` is now deployed using PM2 and has a basic Nginx configuration to proxy API requests.

---

## Part 4: Deploying Static Frontend Files with Nginx

This part covers deploying static frontend files (HTML, CSS, JavaScript, including Tailwind CSS considerations) for `santwoo.com` to your Ubuntu server using Nginx.

### 4.1. Prerequisites for Part 4

*   An Ubuntu server with Nginx installed and running (from Part 2).
*   SSH access to your server with a `sudo` user.
*   Your static frontend files for `santwoo.com` ready for deployment.

### 4.2. Preparing Your Frontend Assets for Deployment

Ensure your assets are optimized for production (minified, compiled).

#### 4.2.1. Important Note for Tailwind CSS Users

If using Tailwind CSS for `santwoo.com`, **compile your CSS locally before deployment.**

1.  **Run your build command locally:** (e.g., `npm run build`)
2.  Locate your compiled CSS file (e.g., in `dist/` or `public/`). This is what you'll upload.
3.  **Do NOT upload raw Tailwind configuration files** or source CSS files for server-side compilation.

### 4.3. Choosing a Server Location for Your Frontend Files

We'll store the `santwoo.com` frontend files in `/var/www/santwoo.com/frontend/html`.

```bash
sudo mkdir -p /var/www/santwoo.com/frontend/html
sudo chown -R $USER:$USER /var/www/santwoo.com/frontend/html
```

### 4.4. Uploading Your Frontend Files

Transfer your prepared static assets for `santwoo.com` to `/var/www/santwoo.com/frontend/html`.

#### 4.4.1. Using Git (Recommended for built assets)

1.  Commit your built frontend assets to a Git repository.
2.  On your server:
    ```bash
    cd /var/www/santwoo.com/frontend
    sudo git clone https://your-frontend-git-repo.git html
    # Or if already cloned:
    # cd /var/www/santwoo.com/frontend/html && git pull
    ```

#### 4.4.2. Using `scp` or WinSCP

**On Linux/macOS (`scp`):**
```bash
scp -r /path/to/your/local/frontend-build-output/* your_sudo_user@YOUR_DROPLET_IP:/var/www/santwoo.com/frontend/html/
```
**On Windows (WinSCP):** Drag and drop your built frontend files to `/var/www/santwoo.com/frontend/html/` on the server.

### 4.5. Configuring Nginx to Serve Static Files and Proxy Backend

Modify the Nginx server block for `santwoo.com` (e.g., `/etc/nginx/sites-available/santwoo.com`) to serve both the frontend and the backend API.

```nginx
server {
    listen 80;
    server_name santwoo.com www.santwoo.com; # Will be finalized in Part 6

    # Location for frontend files (root)
    location / {
        root /var/www/santwoo.com/frontend/html;
        try_files $uri $uri/ /index.html; # For SPAs, try_files ensures client-side routing works
        index index.html index.htm;
    }

    # Location for backend API
    location /api {
        proxy_pass http://localhost:3000; # Points to your Node.js app from Part 3
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Optional: Custom error pages
    # error_page 404 /404.html; # Ensure /404.html exists in your frontend root
    # location = /404.html {
    #     internal;
    # }

    # Optional: Cache control for static assets
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```
**Key changes:**
*   The `location /` block now serves your frontend from `/var/www/santwoo.com/frontend/html`.
*   `try_files $uri $uri/ /index.html;` is important for Single Page Applications (SPAs) like React, Vue, Angular, so that refreshing non-root paths are handled by your `index.html`. If not an SPA, `try_files $uri $uri/ =404;` is also fine.
*   The `/api` location block from Part 3 remains to handle backend requests.

**Enable and Reload Nginx:**
1.  If you just created `/etc/nginx/sites-available/santwoo.com`:
    ```bash
    sudo ln -s /etc/nginx/sites-available/santwoo.com /etc/nginx/sites-enabled/
    ```
    Remove the default site if it conflicts: `sudo rm /etc/nginx/sites-enabled/default` (if it exists and is not needed).
2.  Test configuration: `sudo nginx -t`
3.  Reload Nginx: `sudo systemctl reload nginx`

### 4.6. Testing Your Frontend Deployment

Open `http://YOUR_DROPLET_IP` (or `http://santwoo.com` if DNS is already set up and propagated from Part 5) in your browser. You should see your frontend. Test API calls to ensure the backend is also working.

### 4.7. Conclusion of Part 4

Your static frontend for `santwoo.com` is now deployed and served by Nginx, which also proxies API requests to your Node.js backend.

---

## Part 5: Configuring DNS for `santwoo.com`

This part explains how to configure DNS records for your custom domain `santwoo.com` to point to your DigitalOcean Droplet's IP address.

### 5.1. Prerequisites for Part 5

*   A registered domain name (`santwoo.com`).
*   Access to your domain registrar's control panel or DNS hosting provider.
*   The public IP address of your DigitalOcean Droplet (from Part 1).

### 5.2. Finding Your DigitalOcean Droplet's IP Address

As covered in Part 1, Section 1.4, your Droplet's IP address is visible on your DigitalOcean dashboard. Copy this IP.

### 5.3. Understanding DNS Records (A and CNAME)

*   **A Record:** Maps a domain name (e.g., `santwoo.com`) directly to an IPv4 address.
*   **CNAME Record:** Maps a subdomain (e.g., `www.santwoo.com`) to another domain name (e.g., `santwoo.com`).

### 5.4. General Steps for Configuring DNS Records for `santwoo.com`

Access your DNS management interface provided by your domain registrar.

#### 5.4.1. Creating an A Record for `santwoo.com` (Apex Domain)

*   **Record Type:** `A`
*   **Host/Name:** `@` (or `santwoo.com`)
*   **Value/Points to/IP Address:** `YOUR_DROPLET_IP_ADDRESS` (the one copied from DigitalOcean)
*   **TTL:** Default (e.g., 3600 seconds or 1 hour)

Save the record.

#### 5.4.2. Creating a CNAME Record for `www.santwoo.com`

*   **Record Type:** `CNAME`
*   **Host/Name:** `www`
*   **Value/Points to/Target:** `santwoo.com`
*   **TTL:** Default

Save the record. Delete any conflicting A or CNAME records for `@` and `www` that might point to old hosting.

### 5.5. DNS Propagation

DNS changes can take anywhere from a few minutes to **24-48 hours** to propagate globally. Be patient.

### 5.6. Verifying Your DNS Configuration for `santwoo.com`

After some propagation time:

1.  **Using `ping`:**
    ```bash
    ping santwoo.com
    ping www.santwoo.com
    ```
    Both should resolve to `YOUR_DROPLET_IP_ADDRESS`.
2.  **Online DNS Checkers:** Use tools like `whatsmydns.net` to check A records for `santwoo.com` and CNAME/A records for `www.santwoo.com`.
3.  **Accessing via Browser:** Try `http://santwoo.com` and `http://www.santwoo.com`.

### 5.7. Conclusion of Part 5

Your DNS records for `santwoo.com` are now configured to point to your Droplet. Once propagation is complete, users can access your site via the domain name.

---

## Part 6: Setting Up SSL/TLS with Certbot for `santwoo.com`

This part guides you through securing `santwoo.com` with a free SSL/TLS certificate from Let's Encrypt using Certbot, enabling HTTPS.

### 6.1. Prerequisites for Part 6

*   Ubuntu Server with Nginx installed (Part 2).
*   Domain `santwoo.com` and `www.santwoo.com` DNS records pointing to your server's IP (Part 5, fully propagated).
*   Nginx server block for `santwoo.com` configured for HTTP on port 80 (as in Part 4).
*   Firewall allowing HTTPS traffic (port 443). If using UFW:
    ```bash
    sudo ufw allow 'Nginx Full' # Or 'https' if you previously only allowed 'Nginx HTTP'
    sudo ufw status
    ```

### 6.2. Step 1: Install Certbot and the Nginx Plugin

Using `snapd` for the latest version:

1.  Update package list: `sudo apt update`
2.  Install snapd: `sudo apt install snapd -y` (if not already installed)
3.  Update snapd: `sudo snap install core; sudo snap refresh core`
4.  Remove old Certbot (if any): `sudo apt-get remove certbot`
5.  Install Certbot: `sudo snap install --classic certbot`
6.  Create symlink: `sudo ln -s /snap/bin/certbot /usr/bin/certbot`

### 6.3. Step 2: Verify Your Nginx Configuration for `santwoo.com`

Certbot needs to find the correct server block. Open `/etc/nginx/sites-available/santwoo.com`:

```bash
sudo nano /etc/nginx/sites-available/santwoo.com
```
Ensure the `server_name` directive is correct:
```nginx
server {
    listen 80;
    server_name santwoo.com www.santwoo.com; # Ensure this is correct

    # ... rest of your configuration from Part 4 ...
    # (root for frontend, location /api for backend proxy)
    location / {
        root /var/www/santwoo.com/frontend/html;
        try_files $uri $uri/ /index.html;
        index index.html index.htm;
    }

    location /api {
        proxy_pass http://localhost:3000;
        # ... other proxy headers ...
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
If changed, test (`sudo nginx -t`) and reload (`sudo systemctl reload nginx`).

### 6.4. Step 3: Obtain an SSL Certificate for `santwoo.com`

Run Certbot for Nginx:
```bash
sudo certbot --nginx
```
Follow prompts:
*   Enter email.
*   Agree to Terms of Service.
*   Choose Y/N for sharing email with EFF.
*   Select `santwoo.com` and `www.santwoo.com` when prompted.

If successful, Certbot will confirm HTTPS enablement.

### 6.5. Step 4: Verify Nginx Configuration for SSL and HTTP to HTTPS Redirect

Certbot automatically updates your Nginx configuration (`/etc/nginx/sites-available/santwoo.com`). It should now include:

*   A server block listening on port 80 that redirects to HTTPS.
*   A server block listening on `443 ssl http2` with:
    *   `ssl_certificate /etc/letsencrypt/live/santwoo.com/fullchain.pem;`
    *   `ssl_certificate_key /etc/letsencrypt/live/santwoo.com/privkey.pem;`
    *   Includes for `options-ssl-nginx.conf` and `ssl-dhparams.pem`.
    *   Your original `location /` and `location /api` blocks.

Test (`sudo nginx -t`) and reload Nginx (`sudo systemctl reload nginx`) if Certbot hasn't already.

### 6.6. Step 5: Verify Certbot Auto-Renewal

Let's Encrypt certificates are valid for 90 days. Certbot sets up automatic renewal.
Test the renewal process:
```bash
sudo certbot renew --dry-run
```
If successful, auto-renewal is configured correctly.

### 6.7. Step 6: Test HTTPS and SSL Certificate for `santwoo.com`

1.  Open `https://santwoo.com` in your browser. Look for the padlock icon.
2.  Test `http://santwoo.com` – it should redirect to HTTPS.
3.  (Optional) Use an online SSL checker like SSL Labs Test for `santwoo.com`.

### 6.8. Conclusion of Part 6

`santwoo.com` is now secured with SSL/TLS, serving traffic over HTTPS, with automatic certificate renewals handled by Certbot.

---

## Part 7: Final Testing and Troubleshooting

This part provides a checklist for final testing and tips for troubleshooting common issues for your `santwoo.com` deployment.

### 7.1. Basic Sanity Checks

*   **Clear Browser Cache/Use Incognito:** Test `https://santwoo.com` in an incognito window or after clearing your browser cache.
*   **Verify HTTPS and Redirects:** Ensure `http://santwoo.com` redirects to `https://santwoo.com` and a padlock icon is shown.
*   **Test Core Functionality:** Click through pages, test forms, logins, etc., on `santwoo.com`.
*   **Different Devices/Browsers (Briefly):** Check basic rendering and functionality.

### 7.2. Checking Server Logs

#### 7.2.1. Nginx Logs

*   Access Log: `sudo tail -f /var/log/nginx/access.log`
*   Error Log: `sudo tail -f /var/log/nginx/error.log` (Crucial for Nginx issues)

#### 7.2.2. Application Logs (PM2 for `santwoo-backend`)

*   List PM2 processes: `pm2 list`
*   View logs for `santwoo-backend`: `pm2 logs santwoo-backend`

### 7.3. Common Issues and Quick Troubleshooting Tips for `santwoo.com`

#### 7.3.1. Issue: `santwoo.com` Doesn't Load or Times Out

*   **DNS Propagation:** Check `santwoo.com` on `whatsmydns.net`.
*   **Server/Nginx Status:** `sudo systemctl status nginx`.
*   **Firewall:** `sudo ufw status` (ensure ports 80, 443 are allowed for Nginx).
*   **PM2 Status:** `pm2 list` (check `santwoo-backend` status).

#### 7.3.2. Issue: 502 Bad Gateway on `santwoo.com`

Nginx cannot reach the `santwoo-backend` application.
*   **Check `santwoo-backend` Status:** `pm2 list`; `pm2 logs santwoo-backend`. Restart if needed: `pm2 restart santwoo-backend`.
*   **Nginx `proxy_pass`:** Ensure `location /api` in `/etc/nginx/sites-available/santwoo.com` correctly points to `http://localhost:3000` (or your backend's port).

#### 7.3.3. Issue: 500 Internal Server Error on `santwoo.com`

Usually an error in the `santwoo-backend` code.
*   **Check `santwoo-backend` logs:** `pm2 logs santwoo-backend` for stack traces.

#### 7.3.4. Issue: Database Connection Problems for `santwoo.com`

*   **Check `santwoo-backend` logs.**
*   **MySQL Status:** `sudo systemctl status mysql`.
*   **Credentials:** Verify `DB_USER=santwoo_user`, `DB_NAME=santwoo_db`, and password in `/var/www/santwoo.com/backend/.env`.

#### 7.3.5. Issue: Static Files Not Loading on `santwoo.com` (404s)

*   **Nginx `root`:** Check `root /var/www/santwoo.com/frontend/html;` in `location /` block of `/etc/nginx/sites-available/santwoo.com`.
*   **File Paths in HTML:** Are they correct relative to the frontend root?
*   **Deployment:** Did compiled assets (e.g., from Tailwind CSS build) get uploaded to `/var/www/santwoo.com/frontend/html`?

#### 7.3.6. Issue: HTTPS Not Working Correctly on `santwoo.com`

*   **SSL Certificate:** `sudo certbot certificates` to check validity.
*   **Nginx SSL Config:** Verify `listen 443 ssl`, `ssl_certificate` paths in `/etc/nginx/sites-available/santwoo.com`.
*   **Mixed Content:** Use browser developer tools (Console) to find HTTP assets loaded on HTTPS pages.

### 7.4. Useful Diagnostic Tools

#### 7.4.1. Browser Developer Tools

*   **Network Tab:** Check request statuses, headers.
*   **Console Tab:** Look for JavaScript errors, mixed content warnings.

#### 7.4.2. `curl` Command

*   Headers: `curl -I https://santwoo.com`
*   Full response (follow redirects): `curl -L https://santwoo.com`

---

## Main Conclusion

Congratulations! By following these seven parts, you have successfully deployed the `santwoo.com` web application, from setting up the DigitalOcean Droplet and server environment to deploying backend and frontend code, configuring DNS, securing your site with SSL/TLS, and performing final checks.

This comprehensive guide provides a solid foundation. Remember to regularly update your server and application dependencies, monitor logs, and keep backups of critical data like your database and SSL certificates. Continuous learning and adaptation to new security practices are key to maintaining a healthy and secure web application.
```
