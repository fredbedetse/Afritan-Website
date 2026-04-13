#!/bin/bash
set -e

if [ -z "$GITHUB_TOKEN" ]; then
  echo "ERROR: GITHUB_TOKEN secret is not set."
  exit 1
fi

REPO_URL="https://${GITHUB_TOKEN}@github.com/fredbedetse/Afritan-Website.git"

export GIT_AUTHOR_NAME="fredbedetse"
export GIT_AUTHOR_EMAIL="fredbedetse@users.noreply.github.com"
export GIT_COMMITTER_NAME="fredbedetse"
export GIT_COMMITTER_EMAIL="fredbedetse@users.noreply.github.com"

echo "Staging all changes..."
git add -A

if git diff --cached --quiet; then
  echo "Nothing to commit — already up to date."
  exit 0
fi

COMMIT_MSG="Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "Pushing to GitHub..."
git push "$REPO_URL" HEAD:main
echo "Done! Changes pushed to https://github.com/fredbedetse/Afritan-Website"
