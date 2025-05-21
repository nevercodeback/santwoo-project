# Setting Up SSL/TLS with Certbot for Nginx on Ubuntu (for santwoo.com)

This guide provides comprehensive steps to secure your domain (`santwoo.com` and `www.santwoo.com`), hosted on an Ubuntu server with Nginx, using a free SSL/TLS certificate from Let's Encrypt via the Certbot tool. This will enable HTTPS on your website.

## Table of Contents

1.  [Prerequisites](#prerequisites)
2.  [Step 1: Install Certbot and the Nginx Plugin](#step-1-install-certbot-and-the-nginx-plugin)
3.  [Step 2: Verify Your Nginx Configuration](#step-2-verify-your-nginx-configuration)
4.  [Step 3: Obtain an SSL Certificate for `santwoo.com`](#step-3-obtain-an-ssl-certificate-for-santwoocom)
5.  [Step 4: Verify Nginx Configuration for SSL and HTTP to HTTPS Redirect](#step-4-verify-nginx-configuration-for-ssl-and-http-to-https-redirect)
    *   [How Certbot Modifies Nginx Configuration](#how-certbot-modifies-nginx-configuration)
6.  [Step 5: Verify Certbot Auto-Renewal](#step-5-verify-certbot-auto-renewal)
7.  [Step 6: Test HTTPS and SSL Certificate](#step-6-test-https-and-ssl-certificate)
8.  [Conclusion](#conclusion)

## 1. Prerequisites

*   **Ubuntu Server:** An Ubuntu server (preferably LTS version) set up.
*   **Nginx Installed:** Nginx web server installed and running.
*   **Registered Domain Name:** A domain name (this guide uses `santwoo.com`) that you own.
*   **DNS Records Configured:**
    *   An **A record** for `santwoo.com` pointing to your server's public IP address.
    *   An **A record** or **CNAME record** for `www.santwoo.com` pointing to your server's public IP address or `santwoo.com` respectively.
    *   These DNS changes must have propagated. (Refer to the "Configuring DNS to Point Your Domain to a DigitalOcean Droplet" guide if needed).
*   **Nginx Server Block:** You should have an Nginx server block file configured for `santwoo.com` (e.g., in `/etc/nginx/sites-available/santwoo.com`). This file should at least be listening on port 80 and have the correct `server_name` directives.
*   **Firewall Access:** If you have a firewall (like UFW) enabled, ensure it allows HTTPS traffic on port 443.
    ```bash
    sudo ufw allow 'Nginx Full' # Allows both HTTP and HTTPS
    # OR
    # sudo ufw allow https
    sudo ufw status
    ```

## 2. Step 1: Install Certbot and the Nginx Plugin

It's recommended to install Certbot using `snapd` as it provides the latest version with all dependencies.

1.  **Update your system's package list:**
    ```bash
    sudo apt update
    ```
2.  **Install snapd (if not already installed):**
    ```bash
    sudo apt install snapd -y
    ```
3.  **Ensure your version of snapd is up to date:**
    ```bash
    sudo snap install core; sudo snap refresh core
    ```
4.  **Remove any old Certbot packages (if installed via apt):**
    If you previously installed Certbot using `apt`, remove it to avoid conflicts.
    ```bash
    sudo apt-get remove certbot
    ```
5.  **Install Certbot using snap:**
    ```bash
    sudo snap install --classic certbot
    ```
6.  **Prepare Certbot command:** Create a symbolic link to the Certbot command so you can run it easily.
    ```bash
    sudo ln -s /snap/bin/certbot /usr/bin/certbot
    ```
    The Nginx plugin for Certbot (`python3-certbot-nginx`) will be handled by the snap package, so you typically don't need to install it separately when using the snap version of Certbot.

## 3. Step 2: Verify Your Nginx Configuration

Certbot needs to find the correct server block in your Nginx configuration to automatically set up SSL. This is done by reading the `server_name` directive.

1.  Open your domain's Nginx server block file. For `santwoo.com`, this might be `/etc/nginx/sites-available/santwoo.com` or `/etc/nginx/sites-available/default` if that's where it's configured.
    ```bash
    sudo nano /etc/nginx/sites-available/santwoo.com
    ```
2.  Ensure the `server_name` directive correctly includes your domain and the `www` subdomain:
    ```nginx
    server {
        listen 80;
        # listen [::]:80; # Optional: for IPv6

        server_name santwoo.com www.santwoo.com; # Make sure this line is correct

        # ... other configurations like root, index, location blocks ...
        # For example, for a static site:
        # root /var/www/santwoo.com/html;
        # index index.html index.htm;
        #
        # location / {
        #    try_files $uri $uri/ =404;
        # }
    }
    ```
3.  If you made changes, save the file and test your Nginx configuration:
    ```bash
    sudo nginx -t
    ```
4.  If the test is successful, reload Nginx:
    ```bash
    sudo systemctl reload nginx
    ```

## 4. Step 3: Obtain an SSL Certificate for `santwoo.com`

Now you can use Certbot to obtain the SSL certificate for your domain. Certbot will automatically attempt to modify your Nginx configuration to install the certificate.

1.  **Run Certbot for Nginx:**
    ```bash
    sudo certbot --nginx
    ```

2.  **Follow the on-screen prompts:**
    *   **Enter email address (used for urgent renewal and security notices):** Provide a valid email address.
    *   **Terms of Service:** Read the terms and agree (A) if you accept.
    *   **Share email with EFF:** Choose Yes (Y) or No (N).
    *   **Which names would you like to activate HTTPS for?:** Certbot will list the domain names it found from your Nginx configuration (based on `server_name` directives). You should see `santwoo.com` and `www.santwoo.com`.
        *   If they are listed, select the numbers corresponding to both domains (e.g., `1 2` if they are options 1 and 2, or leave blank to select all). Press Enter.
        *   If they are not listed, you need to cancel (Ctrl+C) and fix your Nginx configuration (Step 2).
    *   Certbot will then obtain the certificate and attempt to edit your Nginx configuration to use it.

If successful, Certbot will output a message saying it has successfully enabled HTTPS for your domains and where your certificate and key are stored (typically in `/etc/letsencrypt/live/santwoo.com/`).

## 5. Step 4: Verify Nginx Configuration for SSL and HTTP to HTTPS Redirect

Certbot should automatically update your Nginx server block for `santwoo.com` to handle SSL and redirect HTTP traffic to HTTPS.

1.  **Examine your Nginx configuration file again:**
    ```bash
    sudo nano /etc/nginx/sites-available/santwoo.com
    ```

### How Certbot Modifies Nginx Configuration

You should see changes similar to this (comments added for explanation):

```nginx
server {
    # This block might be the original HTTP block, now primarily for redirection
    listen 80;
    # listen [::]:80; # Optional: for IPv6
    server_name santwoo.com www.santwoo.com;

    # Certbot adds this redirect to HTTPS
    # It might also comment out previous settings in this block if it creates a new server block for HTTPS
    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    } # Managed by Certbot
}

# Certbot usually creates a new server block for HTTPS or heavily modifies the existing one
server {
    listen 443 ssl http2; # Listen on port 443 for SSL, optionally with http2
    # listen [::]:443 ssl http2; # Optional: for IPv6
    server_name santwoo.com www.santwoo.com;

    # SSL certificate paths added by Certbot
    ssl_certificate /etc/letsencrypt/live/santwoo.com/fullchain.pem; # Managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/santwoo.com/privkey.pem; # Managed by Certbot

    # Other SSL configurations added by Certbot (often in a separate snippet)
    include /etc/letsencrypt/options-ssl-nginx.conf; # Managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # Managed by Certbot

    # ... your original configurations like root, index, location blocks should be here ...
    # For example:
    # root /var/www/santwoo.com/html;
    # index index.html index.htm;
    #
    # location / {
    #    try_files $uri $uri/ =404;
    # }
}
```

**Key changes made by Certbot:**
*   **Listening on Port 443:** The server block for `santwoo.com` will now have a `listen 443 ssl;` directive.
*   **SSL Certificate Directives:** `ssl_certificate` and `ssl_certificate_key` directives point to the certificate and private key files provided by Let's Encrypt.
*   **SSL Parameters:** It often includes `options-ssl-nginx.conf` and `ssl-dhparams.pem` for recommended SSL settings (like ciphers, protocols).
*   **HTTP to HTTPS Redirect:** Your original HTTP server block (listening on port 80) is usually modified to automatically redirect all HTTP requests to HTTPS using a 301 redirect.

2.  **Test Nginx configuration after Certbot's changes:**
    ```bash
    sudo nginx -t
    ```
3.  **Reload Nginx if successful:**
    ```bash
    sudo systemctl reload nginx
    ```

## 6. Step 5: Verify Certbot Auto-Renewal

Let's Encrypt certificates are valid for 90 days. Certbot automatically creates a renewal process to get new certificates before they expire.

1.  **How renewal works:** During installation, Certbot adds a cron job (in `/etc/cron.d/certbot`) or a systemd timer that runs twice a day. This job checks if any certificates are due for renewal (typically within 30 days of expiry) and renews them if necessary. It also reloads Nginx if a certificate is successfully renewed.

2.  **Test the renewal process (dry run):**
    You can simulate the renewal process to ensure it's working correctly without actually renewing a valid certificate.
    ```bash
    sudo certbot renew --dry-run
    ```
    If this command runs without errors, your auto-renewal setup is likely correct. You should see messages indicating the dry run was successful.

    If you encounter errors, ensure your Nginx configuration is still valid and that your server can make outbound connections on port 80/443 for the renewal challenges.

## 7. Step 6: Test HTTPS and SSL Certificate

1.  Open your web browser and navigate to `https://santwoo.com`.
2.  You should see:
    *   A **padlock icon** in the browser's address bar, indicating a secure connection.
    *   The URL should start with `https://`.
3.  Try navigating to `http://santwoo.com` (without the `s`). You should be automatically redirected to `https://santwoo.com`.
4.  You can also use an online SSL checker tool (like `https://www.ssllabs.com/ssltest/`) to analyze your domain's SSL configuration and get a grade.

## 8. Conclusion

You have successfully installed Certbot, obtained an SSL/TLS certificate for `santwoo.com` and `www.santwoo.com`, and configured Nginx to use HTTPS. Certbot will handle automatic renewals, ensuring your site remains secure.

Remember to:
*   Keep your server's operating system and Certbot package updated.
*   Backup your `/etc/letsencrypt/` directory, especially if you are not using a standard volume for your Droplet that includes backups. This directory contains your certificates and private keys.

Your website is now served over a secure HTTPS connection, protecting your users' data and potentially improving your search engine ranking.
```
