#!/bin/bash
# Cloudflare Deployment Setup Script
# This script helps set up your project for Cloudflare Pages deployment

set -e

echo "🚀 BDESH E-commerce - Cloudflare Pages Setup"
echo "=============================================="

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g @cloudflare/wrangler
else
    echo "✅ Wrangler CLI is already installed"
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION"

# Create .env.cloudflare if it doesn't exist
if [ ! -f .env.cloudflare ]; then
    echo "📝 Creating .env.cloudflare..."
    cp .env.example .env.cloudflare
    echo "⚠️  Please update .env.cloudflare with your Cloudflare credentials"
else
    echo "✅ .env.cloudflare already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Display next steps
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.cloudflare with your Cloudflare credentials:"
echo "   - CLOUDFLARE_ACCOUNT_ID"
echo "   - CLOUDFLARE_API_TOKEN"
echo "   - CLOUDFLARE_PROJECT_NAME"
echo ""
echo "2. Connect your domain to Cloudflare (if not already done)"
echo ""
echo "3. Deploy using one of these methods:"
echo "   a) Using Wrangler: wrangler pages deploy frontend/web/.next/standalone"
echo "   b) Push to GitHub and use CI/CD workflow"
echo ""
echo "4. Add environment variables to Cloudflare Pages dashboard"
echo ""
echo "For detailed instructions, see CLOUDFLARE_DEPLOYMENT.md"
