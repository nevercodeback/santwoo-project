# Deploying Static Frontend Files (HTML, CSS, JavaScript) to Ubuntu with Nginx

This guide provides step-by-step instructions for deploying static frontend web files (HTML, CSS, JavaScript) to an Ubuntu server using Nginx. It includes specific considerations for projects using Tailwind CSS.

This guide assumes you have already:
1.  Set up an Ubuntu server.
2.  Installed Nginx (as detailed in the "Guide to Configuring Server Environment on Ubuntu Droplet" or similar).
3.  Have a domain name pointed to your server's IP address (optional, you can use the IP address directly).

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Preparing Your Frontend Assets for Deployment](#preparing-your-frontend-assets-for-deployment)
    *   [Important Note for Tailwind CSS Users](#important-note-for-tailwind-css-users)
3.  [Choosing a Server Location for Your Files](#choosing-a-server-location-for-your-files)
4.  [Uploading Your Frontend Files](#uploading-your-frontend-files)
    *   [Using Git (Recommended)](#using-git-recommended)
    *   [Using `scp` (Linux/macOS) or WinSCP (Windows)](#using-scp-linuxmacos-or-winscp-windows)
5.  [Configuring Nginx to Serve Static Files](#configuring-nginx-to-serve-static-files)
    *   [Creating the Nginx Server Block](#creating-the-nginx-server-block)
    *   [Enabling the Site and Reloading Nginx](#enabling-the-site-and-reloading-nginx)
6.  [Testing Your Deployment](#testing-your-deployment)
7.  [Conclusion](#conclusion)

## 1. Prerequisites

*   An Ubuntu server with Nginx installed and running.
*   SSH access to your server with a `sudo` user.
*   Your static frontend files (HTML, CSS, JavaScript, images, etc.) ready for deployment.
*   If using a domain, ensure its DNS records point to your server's IP address.

## 2. Preparing Your Frontend Assets for Deployment

Before uploading, ensure your assets are optimized for production. This might include:
*   Minifying HTML, CSS, and JavaScript files.
*   Optimizing images.
*   Compiling code from preprocessors (like Sass to CSS, or TypeScript to JavaScript).

### 2.1. Important Note for Tailwind CSS Users

If you are using Tailwind CSS, it's crucial that you **compile your CSS locally before deployment.** Tailwind CSS works by scanning your template files for class names and generating a CSS file with only the styles you actually use.

1.  **Run your build command locally:** In your project's root directory on your local machine, run the build script defined in your `package.json`. This is typically:
    ```bash
    npm run build
    ```
    Or, if you don't have a script, you might run the Tailwind CLI directly:
    ```bash
    npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify
    ```
    (Adjust paths according to your project structure.)

2.  **Locate your compiled CSS file:** This command will generate a final CSS file (e.g., in a `dist/` or `public/assets/css/` directory). This is the CSS file you need to upload to the server.

3.  **Do NOT upload raw Tailwind configuration files** (`tailwind.config.js`, `postcss.config.js`) or your source CSS files (e.g., `src/input.css`) with the expectation that the server will compile them. The server's role here is just to serve the already built, static files.

**The files you upload to the server should be the final, browser-ready static assets.**

## 3. Choosing a Server Location for Your Files

A common practice is to store website files in `/var/www/`. For each site or domain, you can create a subdirectory. If you have a domain like `yourdomain.com`, you might use:

*   `/var/www/yourdomain.com/html`

If you're just using an IP address, you could use a descriptive name like:

*   `/var/www/my-static-site/html`

The `html` subdirectory is a common convention to hold the actual web content, separating it from logs or other site-related files you might store in `yourdomain.com`.

**Create this directory on your server:**

```bash
# Replace yourdomain.com with your actual domain or project name
sudo mkdir -p /var/www/yourdomain.com/html
# Set ownership to your sudo user for easy uploading (adjust if needed)
sudo chown -R $USER:$USER /var/www/yourdomain.com/html
```

## 4. Uploading Your Frontend Files

Transfer your prepared static assets (HTML, compiled CSS, JavaScript, images, etc.) from your local machine to the server directory created above (e.g., `/var/www/yourdomain.com/html`).

### 4.1. Using Git (Recommended)

If your project (or at least the built assets) is managed with Git:

1.  **Commit your built assets:** After running your build process locally, commit the generated files (e.g., everything in your `dist` or `public` folder) to your Git repository.
2.  **On your server:**
    *   If you haven't cloned the repository yet:
        ```bash
        cd /var/www/yourdomain.com
        sudo git clone https://your-git-repository-url.git html # Clones directly into 'html'
        # Or clone then move:
        # sudo git clone https://your-git-repository-url.git temp_project
        # sudo mv temp_project/* temp_project/.git* html/
        # sudo rm -rf temp_project
        ```
    *   If already cloned, pull the latest changes:
        ```bash
        cd /var/www/yourdomain.com/html
        git pull
        ```
    Ensure the web server (Nginx) will have read permissions for these files. The `chown` command in step 3 usually suffices if Nginx runs as a user who is part of the same group as `$USER`.

### 4.2. Using `scp` (Linux/macOS) or WinSCP (Windows)

**On Linux/macOS (using `scp`):**

Navigate to your local project's build output directory (e.g., `dist/` or `public/`).
```bash
# Example: copying all files from local 'dist/' to server's html directory
# Ensure you are in the parent directory of 'dist' or specify full path to dist/*
scp -r /path/to/your/local/build-output/* your_sudo_user@YOUR_SERVER_IP:/var/www/yourdomain.com/html/
```
The `-r` flag is for recursive copying if you have subdirectories (like `assets/`).

**On Windows (using WinSCP):**

1.  Download and install WinSCP from [https://winscp.net/](https://winscp.net/).
2.  Connect to your server using WinSCP (SFTP protocol, your server IP, username, and SSH key/password).
3.  In WinSCP, navigate to your server's target directory (e.g., `/var/www/yourdomain.com/html/`) in the right-hand panel.
4.  In the left-hand panel, navigate to your local project's build output directory (e.g., `dist/` or `public/`).
5.  Select all files and folders in the local build output directory and drag them to the server directory panel.

## 5. Configuring Nginx to Serve Static Files

Nginx needs a "server block" (similar to Apache's virtual hosts) to define how to handle requests for your site.

### 5.1. Creating the Nginx Server Block

1.  **Create a new Nginx configuration file:**
    Replace `yourdomain.com` with your actual domain name or a descriptive name if you're using an IP.
    ```bash
    sudo nano /etc/nginx/sites-available/yourdomain.com
    ```

2.  **Add the following configuration:**

    ```nginx
    server {
        listen 80;
        listen [::]:80; # For IPv6

        # Replace with your domain name or server IP address
        server_name yourdomain.com www.yourdomain.com YOUR_SERVER_IP;

        # Path to your static files
        root /var/www/yourdomain.com/html;

        # Default file to serve
        index index.html index.htm;

        # Standard location block for handling requests
        location / {
            try_files $uri $uri/ =404; # Serve file if exists, then directory, else 404
        }

        # Optional: Custom error pages
        # error_page 404 /404.html;
        # location = /404.html {
        #     internal;
        # }

        # Optional: Cache control for static assets (improves performance)
        # location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|webp)$ {
        #     expires 7d; # Cache these files for 7 days
        #     add_header Cache-Control "public";
        # }
    }
    ```

    **Key directives:**
    *   `listen 80;`: Listen on port 80 for HTTP traffic.
    *   `server_name`: Specifies which domain(s) or IP this server block should respond to.
    *   `root`: The absolute path to the directory containing your website files (e.g., where your `index.html` is).
    *   `index`: Specifies the default file(s) to serve if a directory is requested. Nginx will look for `index.html` first, then `index.htm`.
    *   `location / { try_files $uri $uri/ =404; }`: This tells Nginx how to find files. It tries the literal URI, then checks if it's a directory (and serves the `index` file from it), otherwise returns a 404 error.
    *   **Optional Caching:** The commented-out `location` block for static assets shows how to set browser caching headers, which can improve site performance for returning visitors.

3.  Save and close the file (Ctrl+X, then Y, then Enter in `nano`).

### 5.2. Enabling the Site and Reloading Nginx

1.  **Create a symbolic link** from `sites-available` to `sites-enabled`. This tells Nginx to use this configuration.
    ```bash
    sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
    ```
    **Important:** Before creating a new symlink, ensure you don't have a `default` site symlink in `sites-enabled` that might conflict (e.g., also listening on port 80 for all requests). If you do, and it's not needed, you can remove it: `sudo rm /etc/nginx/sites-enabled/default`.

2.  **Test your Nginx configuration for syntax errors:**
    ```bash
    sudo nginx -t
    ```
    If it reports any errors, re-check your configuration file.

3.  **Reload Nginx to apply the changes:**
    If the test is successful (`syntax is ok`, `test is successful`):
    ```bash
    sudo systemctl reload nginx
    ```

## 6. Testing Your Deployment

Open your web browser and navigate to:
*   `http://yourdomain.com` (if you configured a domain)
*   or `http://YOUR_SERVER_IP`

You should see your `index.html` page and be able to access other uploaded assets. If you encounter issues:
*   Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
*   Ensure file paths in your Nginx config are correct.
*   Verify file permissions on the server (Nginx needs read access).
*   Clear your browser cache, especially if testing caching rules.

## 7. Conclusion

You have successfully deployed your static frontend files to your Ubuntu server and configured Nginx to serve them. For production sites, consider:
*   **Setting up HTTPS:** Use Let's Encrypt with Certbot to get free SSL certificates and serve your site over HTTPS. This involves updating your Nginx configuration to listen on port 443.
*   **More advanced caching:** Fine-tune caching headers.
*   **Logging:** Configure access and error logs as needed.

Remember to always run build processes (like for Tailwind CSS) *before* uploading your files to ensure you are deploying the final, optimized assets.
```
