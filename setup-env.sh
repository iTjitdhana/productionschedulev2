#!/bin/bash

# ========================================
# Environment Setup Script
# ========================================
# This script creates .env files for development and production

echo "🔧 Setting up environment files..."

# ========================================
# Frontend .env.development
# ========================================
cat > .env.development << 'EOF'
# ========================================
# Frontend Environment - Development
# ========================================

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3107
NEXT_PUBLIC_API_PREFIX=/api

# Environment
NEXT_PUBLIC_APP_ENV=development
NODE_ENV=development

# Server Configuration
PORT=3017
HOST=localhost

# Debug Mode
NEXT_PUBLIC_DEBUG=true
EOF

echo "✅ Created .env.development"

# ========================================
# Frontend .env.production
# ========================================
cat > .env.production << 'EOF'
# ========================================
# Frontend Environment - Production
# ========================================

# API Configuration
# ⚠️ IMPORTANT: Update this to your production server IP/domain
NEXT_PUBLIC_API_BASE_URL=http://192.168.0.96:3107
NEXT_PUBLIC_API_PREFIX=/api

# Environment
NEXT_PUBLIC_APP_ENV=production
NODE_ENV=production

# Server Configuration
PORT=3017
HOST=0.0.0.0

# Debug Mode
NEXT_PUBLIC_DEBUG=false
EOF

echo "✅ Created .env.production"

# ========================================
# Backend .env.development
# ========================================
cat > backend/.env.development << 'EOF'
# ========================================
# Backend Environment - Development
# ========================================

# Server Configuration
PORT=3107
NODE_ENV=development
API_PREFIX=/api

# Database Configuration (MySQL)
DB_HOST=192.168.0.96
DB_PORT=3306
DB_USER=jitdhana
DB_PASSWORD=iT12345$
DB_NAME=manufacturing_system
DB_TIMEZONE=+07:00
DB_CONNECTION_LIMIT=10
DB_DATE_STRINGS=true

# CORS Configuration
CORS_ORIGIN=*

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Security
HELMET_ENABLED=true
EOF

echo "✅ Created backend/.env.development"

# ========================================
# Backend .env.production
# ========================================
cat > backend/.env.production << 'EOF'
# ========================================
# Backend Environment - Production
# ========================================

# Server Configuration
PORT=3107
NODE_ENV=production
API_PREFIX=/api

# Database Configuration (MySQL)
# ⚠️ IMPORTANT: Update credentials for production
DB_HOST=192.168.0.96
DB_PORT=3306
DB_USER=jitdhana
DB_PASSWORD=iT12345$
DB_NAME=manufacturing_system
DB_TIMEZONE=+07:00
DB_CONNECTION_LIMIT=20
DB_DATE_STRINGS=true

# CORS Configuration
# ⚠️ Whitelist specific origins
CORS_ORIGIN=http://192.168.0.96:3017,http://localhost:3017

# Logging
LOG_LEVEL=info

# Rate Limiting (Stricter)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60

# Security
HELMET_ENABLED=true
EOF

echo "✅ Created backend/.env.production"

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Review and update credentials in .env.production files"
echo "   2. Never commit .env files to Git"
echo "   3. Run: npm run dev (frontend) or npm run dev (backend)"


