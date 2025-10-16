# 🚀 Production Schedule System - Deployment Guide

## 📋 Prerequisites

### Linux Server Requirements:
- **OS**: Ubuntu 20.04+ หรือ CentOS 8+
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Memory**: 2GB RAM minimum
- **Storage**: 10GB free space
- **Network**: Access to MySQL server (192.168.0.96:3306)

### External Dependencies:
- **MySQL Server**: ต้องรันอยู่ที่ 192.168.0.96:3306
- **Database**: manufacturing_system
- **User**: jitdhana (with proper permissions)

## 🔧 Installation Steps

### 1. Install Docker & Docker Compose
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# CentOS/RHEL
sudo yum install -y docker docker-compose
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Clone Repository
```bash
git clone https://github.com/iTjitdhana/productionschedulev1.git
cd productionschedulev1
```

### 3. Configure Environment
```bash
# Copy production environment file
cp env.production .env

# Edit if needed
nano .env
```

### 4. Deploy Application
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## 🌐 Access URLs

After successful deployment:
- **Frontend**: http://localhost:3017
- **Backend API**: http://localhost:3107
- **API Health Check**: http://localhost:3107/api/health

## 🔧 Management Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
```

### Stop Services
```bash
docker compose down
```

### Restart Services
```bash
docker compose restart
```

### Update Services
```bash
git pull
docker compose down
docker compose up --build -d
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :3015
sudo netstat -tulpn | grep :3105

# Kill process if needed
sudo kill -9 <PID>
```

#### 2. Database Connection Failed
```bash
# Test database connectivity
mysql -h 192.168.0.96 -P 3306 -u jitdhana -p

# Check firewall
sudo ufw status
sudo ufw allow 3306
```

#### 3. Container Won't Start
```bash
# Check container logs
docker compose logs backend
docker compose logs frontend

# Check container status
docker compose ps
```

#### 4. Frontend Can't Connect to Backend
```bash
# Check if backend is running
curl http://localhost:3105/api/health

# Check environment variables
docker compose exec frontend env | grep API
```

## 🔒 Security Considerations

### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 3015/tcp  # Frontend
sudo ufw allow 3105/tcp  # Backend
sudo ufw deny 3306/tcp   # MySQL (internal only)
```

### Environment Variables
- Never commit `.env` files to git
- Use strong passwords for database
- Restrict CORS origins in production

## 📊 Monitoring

### Health Checks
```bash
# API Health
curl http://localhost:3107/api/health

# Frontend Health
curl http://localhost:3017

# Database Health (from server)
mysql -h 192.168.0.96 -u jitdhana -p -e "SELECT 1;"
```

### Resource Usage
```bash
# Container resource usage
docker stats

# Disk usage
df -h
docker system df
```

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
mysqldump -h 192.168.0.96 -u jitdhana -p manufacturing_system > backup_$(date +%Y%m%d).sql

# Restore backup
mysql -h 192.168.0.96 -u jitdhana -p manufacturing_system < backup_20250116.sql
```

### Application Backup
```bash
# Backup application data
tar -czf app_backup_$(date +%Y%m%d).tar.gz /path/to/app

# Backup Docker volumes (if any)
docker run --rm -v app_data:/data -v $(pwd):/backup alpine tar czf /backup/volumes_backup.tar.gz /data
```

## 📞 Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify database connectivity
3. Check firewall settings
4. Review environment variables
5. Contact development team

---

**Last Updated**: 16 ตุลาคม 2025  
**Version**: 2.5  
**Environment**: Production Linux Server
