# Walkthrough — SSL/HTTPS Configuration via Nginx & Certbot

This walkthrough summarizes the actions taken to configure secure SSL/HTTPS access for the Umeed Coding Platform on the EC2 server (`51.20.253.227`) at domain **`ummeedcodelab.duckdns.org`**.

---

## 🛠️ Actions Completed

### 1. Disk Space Optimization (Troubleshooting)
Initially, installing packages failed due to a `No space left on device` error (the 6.7GB root partition `/dev/root` was 100% full with only 84KB remaining). We reclaimed **839MB** by executing:
- **NPM Cache Cleanup**: `rm -rf /home/ubuntu/.npm` (freed ~568MB).
- **Docker Prune**: `docker system prune -a -f` (freed cached image data).
- **Next.js Cache Cleanup**: `rm -rf ummeed-platform/ummeed-platform/.next/cache`.
- **Package Manager Cleanup**: `sudo apt-get clean` and `pnpm store prune`.

This successfully reduced disk utilization to **88%** (839MB free).

### 2. Nginx & Certbot Installation
Installed Nginx as a reverse proxy along with Certbot and its Nginx automated plugin:
```bash
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 3. Removed iptables Port Redirection
Deleted the active NAT rule that forwarded port 80 traffic straight to port 3000, allowing Nginx to bind to port 80:
```bash
sudo iptables -t nat -D PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000
```

### 4. Configured Nginx Reverse Proxy
Created a server block configuration file at `/etc/nginx/sites-available/ummeedcodelab.duckdns.org` to handle incoming HTTP requests on port 80 and forward them to Next.js on port 3000:
```nginx
server {
    listen 80;
    server_name ummeedcodelab.duckdns.org;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enabled the configuration, disabled the default Nginx page, and restarted the service:
```bash
sudo ln -sf /etc/nginx/sites-available/ummeedcodelab.duckdns.org /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Provisioned Let's Encrypt Certificate
Executed Certbot to acquire certificates and automatically update the Nginx configuration to support SSL and redirect all HTTP traffic to HTTPS:
```bash
sudo certbot --nginx -d ummeedcodelab.duckdns.org --non-interactive --agree-tos --register-unsafely-without-email --redirect
```

### 6. Updated Environment Configuration
Updated `/home/ubuntu/ummeed-platform/ummeed-platform/.env` to reflect the new `https://` protocol so that authentication cookies and callbacks from `Better Auth` and Judge0 webhook executions match secure protocols:
```ini
APP_WEBHOOK_URL=https://ummeedcodelab.duckdns.org
BETTER_AUTH_URL=https://ummeedcodelab.duckdns.org
```
Restarted Next.js in PM2:
```bash
pm2 restart ummeed-web --update-env
```

---

## 🧪 Verification & Results

### 1. Active Listening Sockets
Verified Nginx is successfully listening on port 80 and port 443 (SSL), while Next.js is bound to local port 3000:
```
tcp   LISTEN 0      511                     *:3000             *:*    users:(("next-server (v1",pid=229418,fd=18))
tcp   LISTEN 0      511                     *:80               *:*    users:(("nginx",pid=317005,fd=6))
tcp   LISTEN 0      511                     *:443              *:*    users:(("nginx",pid=317005,fd=7))
```

### 2. HTTPS Connectivity & Redirect Test
Ran headers check from the server:
*   **Direct HTTPS request**:
    ```bash
    curl -I https://ummeedcodelab.duckdns.org
    ```
    *Response*:
    ```http
    HTTP/1.1 307 Temporary Redirect
    Server: nginx/1.28.3 (Ubuntu)
    Location: /dashboard
    ```
    *(Confirms Nginx successfully proxy-passes requests to Next.js)*

*   **HTTP to HTTPS Redirect**:
    ```bash
    curl -I http://ummeedcodelab.duckdns.org
    ```
    *Response*:
    ```http
    HTTP/1.1 301 Moved Permanently
    Server: nginx/1.28.3 (Ubuntu)
    Location: https://ummeedcodelab.duckdns.org/
    ```
    *(Confirms Nginx automatically upgrades insecure connections to SSL/HTTPS)*
