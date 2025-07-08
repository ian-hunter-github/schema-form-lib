#!/bin/bash

# Configuration
SOURCE_DIR="/Users/developer/Documents/Development/schema-form-app"
TARGET_DIR="/Users/developer/Documents/Development/schema-form-lib"
BACKUP_DIR="$TARGET_DIR/backup_$(date +%Y%m%d_%H%M%S)"

# Create backup
echo "Creating backup of target directory..."
mkdir -p "$BACKUP_DIR"
cp -r "$TARGET_DIR"/* "$BACKUP_DIR/"

# Copy source files
echo "Copying source files..."
rsync -av --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  "$SOURCE_DIR/src/" "$TARGET_DIR/src/"

# Handle special files
echo "Merging configuration files..."
cp "$SOURCE_DIR/tsconfig.json" "$TARGET_DIR/tsconfig.schema-form.json"
cp "$SOURCE_DIR/eslint.config.js" "$TARGET_DIR/"

# Merge package.json
echo "Merging package.json..."
jq -s '.[0] * .[1]' "$TARGET_DIR/package.json" "$SOURCE_DIR/package.json" > "$TARGET_DIR/package.json.tmp"
mv "$TARGET_DIR/package.json.tmp" "$TARGET_DIR/package.json"

echo "Migration complete. Backup created at: $BACKUP_DIR"
