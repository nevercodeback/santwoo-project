# Final Testing and Troubleshooting Guide for Deployed Web Applications

After deploying your web application and configuring DNS and SSL, it's crucial to perform final tests and know how to troubleshoot common issues. This guide provides a concise checklist and tips.

This guide assumes you have:
*   Deployed your web application (e.g., Node.js backend, static frontend).
*   Configured Nginx (or another web server) as a reverse proxy/server.
*   Set up DNS for your domain.
*   Enabled HTTPS (e.g., with Certbot).

## Table of Contents

1.  [Basic Sanity Checks](#basic-sanity-checks)
2.  [Checking Server Logs](#checking-server-logs)
    *   [Nginx Logs](#nginx-logs)
    *   [Application Logs (e.g., PM2 for Node.js)](#application-logs-eg-pm2-for-nodejs)
3.  [Common Issues and Quick Troubleshooting Tips](#common-issues-and-quick-troubleshooting-tips)
    *   [Issue: Site Doesn't Load or Times Out](#issue-site-doesnt-load-or-times-out)
    *   [Issue: 502 Bad Gateway Error](#issue-502-bad-gateway-error)
    *   [Issue: 500 Internal Server Error (or other 5xx errors)](#issue-500-internal-server-error-or-other-5xx-errors)
    *   [Issue: Database Connection Problems](#issue-database-connection-problems)
    *   [Issue: Static Files Not Loading (404 Errors for CSS, JS, Images)](#issue-static-files-not-loading-404-errors-for-css-js-images)
    *   [Issue: HTTPS Not Working Correctly](#issue-https-not-working-correctly)
4.  [Useful Diagnostic Tools](#useful-diagnostic-tools)
    *   [Browser Developer Tools](#browser-developer-tools)
    *   [`curl` Command](#curl-command)
5.  [When to Seek Further Help](#when-to-seek-further-help)

## 1. Basic Sanity Checks

Perform these initial checks to catch common client-side or configuration issues:

*   **Clear Browser Cache and Cookies:**
    *   Your browser might have cached old versions of your site or redirects.
    *   **How:** Use your browser's settings to clear cache and cookies, or test in an incognito/private window. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R) can also help.
*   **Verify Domain Loads via HTTPS:**
    *   Open your browser and type `https://yourdomain.com` (e.g., `https://santwoo.com`).
    *   Ensure it loads correctly and shows a padlock icon (secure connection).
    *   Test `http://yourdomain.com` to ensure it redirects to HTTPS.
*   **Test Core Functionality:**
    *   Click through main pages and test key features (e.g., login, form submissions, main interactions).
*   **Test on Different Devices/Browsers (Optional but Recommended):**
    *   Briefly check if the site appears and functions correctly on a mobile device and perhaps a different browser to catch major compatibility issues.

## 2. Checking Server Logs

Server logs are your first point of call for diagnosing issues that aren't client-side.

### 2.1. Nginx Logs

Nginx logs HTTP requests and any errors it encounters.

*   **Access Log:** Records all requests made to Nginx. Useful for seeing what's being requested.
    *   Location: Typically `/var/log/nginx/access.log` (and `access.log` for specific server blocks if configured).
    *   View last few entries: `sudo tail -f /var/log/nginx/access.log`
*   **Error Log:** Records Nginx errors, including issues with configuration or upstream servers (like your backend application). **This is often the most useful log for troubleshooting.**
    *   Location: Typically `/var/log/nginx/error.log`.
    *   View last few entries: `sudo tail -f /var/log/nginx/error.log`

Look for error messages corresponding to the time you experienced an issue.

### 2.2. Application Logs (e.g., PM2 for Node.js)

Your backend application will have its own logs, which are crucial for debugging application-specific errors.

*   **If using PM2 for a Node.js application:**
    *   List processes: `pm2 list` (note the app name or ID)
    *   View logs for a specific app: `pm2 logs your-app-name` (or `pm2 logs APP_ID`)
    *   View logs for all apps: `pm2 logs`
*   **Other Application Stacks:**
    *   The location and method for viewing logs will vary. Check your application framework's documentation or how you're running the application (e.g., systemd service logs via `journalctl`).

Look for stack traces, database error messages, or any custom error logging you've implemented.

## 3. Common Issues and Quick Troubleshooting Tips

### 3.1. Issue: Site Doesn't Load or Times Out

*   **Check DNS propagation:** Use a tool like `whatsmydns.net` to ensure your domain points to the correct IP globally.
*   **Server status:** Is your Droplet/server running? Check your cloud provider's dashboard.
*   **Nginx status:** `sudo systemctl status nginx`. If not running, try `sudo systemctl start nginx`. Check error logs if it fails to start.
*   **Firewall:** Ensure HTTP (80) and HTTPS (443) ports are open. For UFW: `sudo ufw status`.
*   **Application status (if applicable):** Is your backend app running? (e.g., `pm2 list`).

### 3.2. Issue: 502 Bad Gateway Error

This usually means Nginx is running but cannot get a valid response from your backend application (e.g., Node.js/Express, Python/Django, etc.) that it's trying to proxy to.

*   **Check Application Status:**
    *   Is your backend application running? Use `pm2 list` or `sudo systemctl status your-app-service`.
    *   If it's stopped, try restarting it (`pm2 restart your-app-name`).
*   **Check Application Logs:** Look for crashes or errors in your app's logs (e.g., `pm2 logs your-app-name`). The error might have occurred when the application tried to start or handle a request.
*   **Nginx `proxy_pass` Configuration:**
    *   Verify the `proxy_pass` directive in your Nginx server block (e.g., `/etc/nginx/sites-available/yourdomain.com`) points to the correct address and port where your backend application is listening (e.g., `http://localhost:3000`).
*   **Resource Exhaustion:** Your server might be out of memory or CPU. Use `top` or `htop` to check.

### 3.3. Issue: 500 Internal Server Error (or other 5xx errors)

This generally indicates an unhandled error within your backend application code.

*   **Check Application Logs Immediately:** These logs are critical. They will usually contain a stack trace or error message pointing to the problematic code.
*   **Permissions:** Sometimes, the application might not have permission to write to log files, cache directories, or other necessary resources.

### 3.4. Issue: Database Connection Problems

Your application might fail to connect to the database.

*   **Check Application Logs:** They often specify the nature of the database error (e.g., "access denied," "unknown database," "connection refused").
*   **Database Server Status:** Is your MySQL (or other DB) server running? `sudo systemctl status mysql`.
*   **Credentials:** Double-check database host, username, password, and database name in your application's environment variables (e.g., `.env` file). Ensure they match the ones you created.
*   **Firewall:** If your database is on the same server, ensure connections to `localhost` or `127.0.0.1` on the database port (e.g., 3306 for MySQL) are allowed. If the database is on a separate server, ensure the application server's IP is allowed to connect.
*   **User Privileges:** Ensure the database user has the correct privileges for the database from the correct host (e.g., `'myapp_user'@'localhost'`).

### 3.5. Issue: Static Files Not Loading (404 Errors for CSS, JS, Images)

*   **Check Nginx `root` directive:** In your Nginx server block, ensure the `root` directive points to the correct directory where your static files are located (e.g., `/var/www/yourdomain.com/html` or `/var/www/your-app/public`).
*   **File Paths in HTML:** Verify that the paths to your CSS, JS, and image files in your HTML are correct relative to how Nginx is serving them. Use browser developer tools (Network tab) to see the exact URL being requested.
*   **File Permissions:** Ensure Nginx has read permissions for the static files and the directories they are in.
*   **Deployment Process:** Did you run your build step (e.g., `npm run build` for Tailwind CSS or React/Vue/Angular apps) and upload the *compiled* assets to the correct location?
*   **Nginx `location` blocks:** If you have specific `location` blocks for assets, ensure they are configured correctly.

### 3.6. Issue: HTTPS Not Working Correctly

*   **SSL Certificate:** Is your SSL certificate valid and not expired? (Certbot usually handles renewal).
*   **Nginx Configuration for SSL:**
    *   Ensure your Nginx server block is listening on port 443 `ssl`.
    *   Check that `ssl_certificate` and `ssl_certificate_key` paths are correct.
    *   Verify the HTTP to HTTPS redirect is in place.
*   **Mixed Content Warnings:** If your site loads over HTTPS but some images, scripts, or stylesheets are still requested over HTTP, browsers might block them or show warnings. Use browser developer tools (Console tab) to identify mixed content. Update your HTML/code to use `https://` for all assets.
*   **Firewall:** Ensure port 443 is open.

## 4. Useful Diagnostic Tools

### 4.1. Browser Developer Tools

Essential for frontend and network request debugging. Access by right-clicking on your webpage and selecting "Inspect" or "Inspect Element," or by pressing F12.

*   **Network Tab:**
    *   Shows all HTTP requests made by your browser.
    *   Check status codes (200 OK, 404 Not Found, 500 Internal Server Error, etc.).
    *   View request and response headers.
    *   See loading times for assets.
*   **Console Tab:**
    *   Displays JavaScript errors, logging messages from your frontend code, and mixed content warnings.
*   **Elements/Inspector Tab:** Inspect HTML structure and CSS styling.

### 4.2. `curl` Command

A command-line tool to make HTTP requests. Useful for checking raw responses and headers from the server, bypassing browser cache.

*   **Get headers for a URL:**
    ```bash
    curl -I https://yourdomain.com
    ```
    (Look for HTTP status code, `Content-Type`, redirects `Location:` header).
*   **Get full response content:**
    ```bash
    curl -L https://yourdomain.com
    ```
    (`-L` follows redirects).
*   **Test specific Nginx behavior or backend endpoints:**
    ```bash
    curl http://localhost:3000/api/some-endpoint # If testing backend directly on server
    ```

## 5. When to Seek Further Help

If you're stuck:
*   **Consult specific documentation:** For Nginx, your application framework, database, etc.
*   **Search online:** Use specific error messages from your logs to find solutions on forums like Stack Overflow or community sites.
*   **Review previous guides:** Ensure all deployment steps were followed correctly.

By systematically checking these areas, you can identify and resolve most common post-deployment issues.
```
