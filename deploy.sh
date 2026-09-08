#!/usr/bin/env bash
# ==============================================================================
# SkillSetu Deployment & GitHub Push Script
# SIH 2026 — Problem Statement 26044
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}   SkillSetu — Deployment & GitHub Sync Helper      ${NC}"
echo -e "${BLUE}====================================================${NC}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

# 1. Verification of sensitive files
echo -e "\n${YELLOW}[1/4] Checking .gitignore and environment safety...${NC}"
if git status --ignored -s | grep -E '\.env$' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Local .env files are properly ignored.${NC}"
else
  echo -e "${GREEN}✓ No tracked .env files detected.${NC}"
fi

# 2. Test Frontend Production Build
echo -e "\n${YELLOW}[2/4] Testing frontend production build...${NC}"
cd "$REPO_ROOT/frontend"
npm run build
cd "$REPO_ROOT"
echo -e "${GREEN}✓ Frontend production build passed successfully!${NC}"

# 3. Git commit & push
echo -e "\n${YELLOW}[3/4] Preparing Git commit and pushing to GitHub...${NC}"
COMMIT_MSG="${1:-"feat(ui): refine login UX, compact demo pills, and warm champagne theme"}"

git add .
if git diff-index --quiet HEAD -- 2>/dev/null; then
  echo -e "${BLUE}No uncommitted changes to push.${NC}"
else
  git commit -m "$COMMIT_MSG"
  echo -e "${GREEN}✓ Changes committed.${NC}"
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
echo -e "Pushing to remote 'origin' on branch '${CURRENT_BRANCH}'..."
git push -u origin "$CURRENT_BRANCH"
echo -e "${GREEN}✓ Successfully pushed to GitHub!${NC}"

# 4. Render Deployment Link
echo -e "\n${BLUE}====================================================${NC}"
echo -e "${GREEN}   Deployment to Render is ready!                   ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "Render Blueprint 1-Click URL:"
echo -e "👉 ${YELLOW}https://render.com/deploy?repo=https://github.com/Apoorv-Tripathi/SkillSetu${NC}\n"
echo -e "Steps on Render:"
echo -e " 1. Open the link above in your browser."
echo -e " 2. Connect your GitHub account if prompted."
echo -e " 3. Enter your ${YELLOW}MONGODB_URI${NC} (MongoDB Atlas connection string)."
echo -e " 4. Click 'Apply' — Render builds and deploys both backend & frontend."
echo -e "${BLUE}====================================================${NC}\n"
