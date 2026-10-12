# 🚀 Afro Men's Beauty Salon — cPanel Deployment Guide

This guide explains how to deploy the website to a live server using **cPanel**.

---

## 📁 Project Structure

```
BarberShop/               ← Root folder
├── src/                  ← FRONTEND React source code
├── public/               ← FRONTEND static assets
├── index.html            ← FRONTEND entry HTML
├── vite.config.js        ← FRONTEND build config
├── package.json          ← FRONTEND dependencies
├── .env                  ← FRONTEND environment variables
├── .env.example          ← FRONTEND env template (safe to share)
│
└── server/               ← BACKEND Node.js API
    ├── index.js          ← Backend server entry point
    ├── package.json      ← Backend dependencies
    ├── .env              ← Backend environment variables (⚠️ keep secret!)
    ├── .env.example      ← Backend env template (safe to share)
    └── uploads/          ← User-uploaded files (auto-created)
```

---

## 🗄️ STEP 1 — Create a MySQL Database in cPanel

1. Log into **cPanel** → go to **MySQL Database Wizard**.
2. Create a new database (e.g. `youruser_barbershop`).
3. Create a new database user and set a **strong password**.
4. Grant the user **All Privileges** on the database.
5. Note down:
   - **Database host**: usually `localhost`
   - **Database name**: e.g. `youruser_barbershop`
   - **Database user**: e.g. `youruser_dbuser`
   - **Database password**: the password you set

---

## 🟢 STEP 2 — Deploy the Backend (Node.js API) on cPanel

### 2a. Upload the `server/` folder

Upload the entire `server/` folder to your hosting. A good location is:
```
/home/yourusername/barbershop-api/
```
*(You can create this folder via cPanel **File Manager**.)*

> **Do NOT upload `server/node_modules/`** — you'll install it on the server.

### 2b. Set up Environment Variables

In the uploaded folder, create a `.env` file with your real production values:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=youruser_dbuser
DB_PASSWORD=yourStrongPassword
DB_NAME=youruser_barbershop
BASE_URL=https://api.yourdomain.com
EMAIL_USER=kidus0947560155@gmail.com
EMAIL_PASS=klgg qixw jjgk hbyx
```

> ⚠️ `BASE_URL` should be the full URL to your Node.js app (without trailing slash).

### 2c. Set up the Node.js App in cPanel

1. In cPanel, go to **Setup Node.js App**.
2. Click **Create Application**.
3. Fill in:
   - **Node.js version**: 18 or 20 (LTS)
   - **Application mode**: Production
   - **Application root**: `/home/yourusername/barbershop-api`
   - **Application URL**: `api.yourdomain.com` (or `yourdomain.com:3001`)
   - **Application startup file**: `index.js`
4. Click **Create**.
5. In the Node.js App panel, open the **terminal** and run:
   ```bash
   npm install
   ```
6. Click **Restart** to start your API.
7. Test it by visiting: `https://api.yourdomain.com/api/services` — you should see JSON data.

---

## 🌐 STEP 3 — Build & Deploy the Frontend

### 3a. Set the Production API URL

On your **local machine**, edit `.env` (in the project root):

```env
VITE_API_URL=https://api.yourdomain.com
```

### 3b. Build the Frontend

On your **local machine**, run:

```bash
npm run build
```

This creates a `dist/` folder with the production-ready static website.

### 3c. Upload to cPanel public_html

1. In cPanel **File Manager**, go to `public_html/`.
2. Upload the **contents** of the `dist/` folder to `public_html/`.
   - `index.html`
   - `assets/` folder

> If your site is on a subdomain (e.g. `www.yourdomain.com`), upload to the appropriate directory.

### 3d. Configure `.htaccess` for React Router

React Router requires all routes to serve `index.html`. Create a file named `.htaccess` in `public_html/` with:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## ✅ STEP 4 — Verify Everything Works

1. Visit your website: `https://yourdomain.com`
2. Check the homepage loads services, barbers, and the booking modal.
3. Try booking an appointment — confirm it appears in the Admin dashboard.
4. Visit `https://yourdomain.com/admin` and log in.
5. Try uploading a new service image — confirm it saves correctly.

---

## 🔁 How to Update the Site

**Frontend changes:**
1. Make your code changes locally.
2. Run `npm run build`.
3. Re-upload the contents of `dist/` to `public_html/`.

**Backend changes:**
1. Upload the updated `server/index.js` to your Node.js app folder.
2. In cPanel **Setup Node.js App**, click **Restart**.

---

## 🛠️ Running Locally (Development)

From the project root, run:

```bash
npm start
```

This starts both the **frontend** (Vite on port 5173) and the **backend** (Express on port 3001) together.

Or run them separately:

```bash
# Terminal 1 — Frontend only
npm run dev:frontend

# Terminal 2 — Backend only
npm run dev:backend
```
