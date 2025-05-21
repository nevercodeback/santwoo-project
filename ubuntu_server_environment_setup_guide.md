# Guide to Configuring Server Environment on Ubuntu Droplet

This guide details the steps to set up a common server environment on your Ubuntu Droplet, including Node.js, npm, MySQL Server, and Nginx. This guide assumes you have already set up your Droplet and can connect to it via SSH, as outlined in the "Comprehensive Guide to Setting Up a DigitalOcean Droplet".

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Updating Your System](#updating-your-system)
3.  [Installing Node.js and npm](#installing-nodejs-and-npm)
4.  [Installing MySQL Server](#installing-mysql-server)
    *   [Running `mysql_secure_installation`](#running-mysql_secure_installation)
5.  [Creating a MySQL Database and User](#creating-a-mysql-database-and-user)
6.  [Installing Nginx](#installing-nginx)
7.  [Next Steps: Configuring Nginx as a Reverse Proxy (Brief Overview)](#next-steps-configuring-nginx-as-a-reverse-proxy-brief-overview)
8.  [Conclusion](#conclusion)

## 1. Prerequisites

*   An Ubuntu Droplet (preferably the latest LTS version).
*   You are connected to your Droplet via SSH as a user with `sudo` privileges. (Refer to "Initial Server Setup" in the previous guide if you are still using `root`).
*   Basic familiarity with Linux command line.

## 2. Updating Your System

Before installing any new software, it's crucial to update your server's package list and upgrade existing packages.

```bash
sudo apt update
sudo apt upgrade -y
```
Answer `yes` (or use the `-y` flag as shown) if prompted to continue.

## 3. Installing Node.js and npm

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

## 4. Installing MySQL Server

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

### 4.1. Running `mysql_secure_installation`

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

## 5. Creating a MySQL Database and User

It's a best practice to create a dedicated database and user for each application instead of using the MySQL `root` user.

1.  **Log in to the MySQL prompt as the `root` user.**
    You'll be prompted for the MySQL `root` password you set during `mysql_secure_installation`.

    ```bash
    sudo mysql -u root -p
    ```

2.  **Create a new database.**
    Replace `myapp_db` with your desired database name.

    ```sql
    CREATE DATABASE myapp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    ```
    Using `utf8mb4` is recommended for full Unicode support.

3.  **Create a new MySQL user and set a password.**
    Replace `myapp_user` with your desired username and `your_strong_password` with a strong, unique password for this user.
    Using `localhost` means this user can only connect from the local machine (the Droplet itself), which is more secure. If your application runs on a different server, you might need to specify its IP address or `%` for any host (less secure).

    ```sql
    CREATE USER 'myapp_user'@'localhost' IDENTIFIED BY 'your_strong_password';
    ```

4.  **Grant privileges to the new user on the database.**
    This gives `myapp_user` all standard privileges on the `myapp_db` database.

    ```sql
    GRANT ALL PRIVILEGES ON myapp_db.* TO 'myapp_user'@'localhost';
    ```

5.  **Flush privileges** to apply the changes.

    ```sql
    FLUSH PRIVILEGES;
    ```

6.  **Exit the MySQL prompt.**

    ```sql
    EXIT;
    ```

You now have a database and a user ready for your application. Store the database name, username, and password securely.

## 6. Installing Nginx

Nginx is a high-performance web server that can also be used as a reverse proxy, load balancer, and HTTP cache.

1.  **Install Nginx.**

    ```bash
    sudo apt-get install -y nginx
    ```

2.  **Adjust the firewall (if using UFW).**
    If you have UFW (Uncomplicated Firewall) enabled, you'll need to allow traffic to Nginx.
    *   To see available application profiles for UFW: `sudo ufw app list`
    *   Nginx creates a few profiles:
        *   `Nginx HTTP`: Allows traffic on port 80 (standard HTTP).
        *   `Nginx HTTPS`: Allows traffic on port 443 (standard HTTPS).
        *   `Nginx Full`: Allows traffic on both ports 80 and 443.

    Choose the appropriate profile. For now, let's allow HTTP:

    ```bash
    sudo ufw allow 'Nginx HTTP'
    ```
    If you plan to set up SSL/TLS later, you'll use `Nginx HTTPS` or `Nginx Full`.

3.  **Check Nginx service status.**

    ```bash
    sudo systemctl status nginx
    ```
    Press `q` to exit. If it's not active, you can try starting it with `sudo systemctl start nginx`.

4.  **Verify Nginx installation.**
    Open a web browser and navigate to your Droplet's IP address (`http://YOUR_DROPLET_IP`). You should see the default Nginx welcome page.

## 7. Next Steps: Configuring Nginx as a Reverse Proxy (Brief Overview)

If you're running a Node.js application (or any other application server listening on a specific port, e.g., 3000, 8080), you'll typically use Nginx as a reverse proxy. This means Nginx listens for public HTTP(S) requests and forwards them to your application server.

This involves:
1.  **Running your Node.js application:** Ensure your application is running and listening on a specific port (e.g., `localhost:3000`). You might use a process manager like PM2 to keep it running.
2.  **Creating an Nginx server block (virtual host):**
    *   Create a new configuration file in `/etc/nginx/sites-available/your_domain_or_app_name`.
    *   Inside this file, you'll define how Nginx should handle requests for your domain/IP.
    *   A basic example for proxying to a Node.js app on port 3000:

    ```nginx
    server {
        listen 80;
        server_name YOUR_DOMAIN_OR_IP; # e.g., example.com or your Droplet IP

        location / {
            proxy_pass http://localhost:3000; # Assumes your app runs on port 3000
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
3.  **Enabling the server block:** Create a symbolic link from `sites-available` to `sites-enabled`.
    ```bash
    sudo ln -s /etc/nginx/sites-available/your_domain_or_app_name /etc/nginx/sites-enabled/
    ```
4.  **Testing Nginx configuration:**
    ```bash
    sudo nginx -t
    ```
5.  **Reloading Nginx:** If the test is successful, reload Nginx to apply changes.
    ```bash
    sudo systemctl reload nginx
    ```

This is a simplified overview. Proper Nginx configuration can involve SSL setup (HTTPS), more advanced proxy settings, caching, etc. Refer to the Nginx documentation and specific Node.js deployment guides for more details.

## 8. Conclusion

You have now installed and configured key components for a modern web application server: Node.js and npm for your application runtime, MySQL for database storage, and Nginx as a web server/reverse proxy.

Remember to:
*   Secure your MySQL passwords and application credentials.
*   Regularly update your server and software.
*   Consult detailed documentation for Nginx and your specific application framework for production deployment best practices.

Your Ubuntu Droplet is now well-equipped to host dynamic web applications.
```
