#!/bin/bash
set -e

echo "🌸 Setting up E & E Wedding Site"
echo "================================="

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "❌ Node.js is required. Please install it from https://nodejs.org"
  exit 1
fi

echo "✅ Node.js $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies…"
npm install

# Generate Prisma client
echo ""
echo "🗄️  Setting up database…"
npx prisma db push

# Seed the database
echo ""
echo "🌱 Seeding initial data…"
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

echo ""
echo "🎉 Setup complete! Run the development server with:"
echo ""
echo "   npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Admin dashboard: http://localhost:3000/admin"
echo "Admin login:     admin@wedding.com / wedding2026!"
echo ""
echo "⚠️  Don't forget to:"
echo "  1. Update NEXTAUTH_SECRET in .env.local"
echo "  2. Configure email settings (EMAIL_SERVER_*)"
echo "  3. Change the admin password"
