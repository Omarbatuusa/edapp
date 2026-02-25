# EdApp Deployment Manual — Google Cloud Server

> **Server**: `edapp-api-vm` (Google Cloud Compute Engine, `africa-south1-b`)  
> **Deploy directory**: `/opt/edapp`  
> **Domain**: `app.edapp.co.za` (via Cloudflare)

---

## Quick Fix — Restart Crashed Containers

If you see a 502 error and just need to bring the site back up:

```bash
# SSH into the server (via Google Cloud Console or gcloud CLI)
gcloud compute ssh edapp-api-vm --zone=africa-south1-b

# Or use the Cloud Console SSH-in-browser (as shown in your screenshot)

# On the server:
cd /opt/edapp
sudo docker compose --env-file .env.production -f docker-compose.prod.yml up -d
sudo docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

If containers are "Exited" or missing, run the full deploy:

```bash
cd /opt/edapp
sudo bash deploy.sh
```

---

## Full Deployment (Push Code & Rebuild)

### Step 1 — Push Code to GitHub (from your Windows machine)

```powershell
cd "c:\EdApp Final"
git add -A
git commit -m "fix: resolve 502 - improve nginx config and backend startup"
git push origin main
```

### Step 2 — SSH into the Server

Option A — via Google Cloud Console:
1. Go to **Compute Engine** → **VM instances**
2. Click **SSH** next to `edapp-api-vm`

Option B — via gcloud CLI:
```bash
gcloud compute ssh edapp-api-vm --zone=africa-south1-b
```

### Step 3 — Run the Deploy Script

```bash
cd /opt/edapp
sudo bash deploy.sh
```

This will:
1. ✔ Check `.env.production` and SSL certs exist
2. ✔ Pull latest code from GitHub (`git fetch origin main && git reset --hard origin/main`)
3. ✔ Stop existing containers
4. ✔ Build fresh Docker images (takes ~5-10 min)
5. ✔ Start all containers
6. ✔ Wait for API health check
7. ✔ Show container status + smoke test results

### Step 4 — Verify

```bash
# Check all containers are running
sudo docker compose --env-file .env.production -f docker-compose.prod.yml ps

# Check logs if something isn't working
sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs api --tail 50
sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs web --tail 50
sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs proxy --tail 50
```

Then open **https://app.edapp.co.za** in your browser.

---

## First-Time Setup (New Server)

If deploying to a fresh server for the first time:

### 1. Install Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
```

### 2. Clone the Repo

```bash
sudo mkdir -p /opt/edapp
sudo chown $USER:$USER /opt/edapp
cd /opt/edapp
git clone https://github.com/Omarbatuusa/edapp.git .
```

### 3. Create Environment + SSL Certs

```bash
cd /opt/edapp
sudo bash CONFIG_SERVER_ENV.sh
```

This creates `.env.production` and Cloudflare Origin SSL certs in `nginx/ssl/`.

### 4. Upload Firebase Service Account

Upload `firebase-service-account.json` to `/opt/edapp/`:

```bash
# From your local machine (using gcloud scp):
gcloud compute scp firebase-service-account.json edapp-api-vm:/opt/edapp/ --zone=africa-south1-b
```

### 5. Deploy

```bash
cd /opt/edapp
sudo bash deploy.sh
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **502 Bad Gateway** | SSH in → `cd /opt/edapp && sudo docker compose --env-file .env.production -f docker-compose.prod.yml up -d` |
| **Container keeps restarting** | Check logs: `sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs api --tail 100` |
| **"System restart required"** | Run `sudo reboot`, wait 2 minutes, SSH back in, then `cd /opt/edapp && sudo docker compose --env-file .env.production -f docker-compose.prod.yml up -d` |
| **Out of disk space** | `docker system prune -af` to clean old images |
| **SSL cert expired** | Regenerate Cloudflare Origin Certificate and update `nginx/ssl/cert.pem` + `nginx/ssl/key.pem` |
| **Database issues** | `sudo docker compose --env-file .env.production -f docker-compose.prod.yml logs db --tail 50` |

---

## Architecture

```
User → Cloudflare (SSL) → Nginx Proxy (port 80/443)
                            ├── /v1/*    → API container (NestJS, port 3333)
                            └── /*       → Web container (Next.js, port 3000)
                                          
                          API connects to:
                            ├── PostgreSQL (port 5432, internal)
                            └── Redis (port 6379, internal)
```

## Docker Services (5 containers)

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| `proxy` | nginx:alpine | 80, 443 (exposed) | Reverse proxy + SSL |
| `web` | Next.js | 3000 (internal) | Frontend |
| `api` | NestJS | 3333 (internal) | Backend API |
| `db` | PostgreSQL 16 | 5432 (internal) | Database |
| `redis` | Redis 7 | 6379 (internal) | Cache/sessions |
