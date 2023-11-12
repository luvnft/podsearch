#!/bin/bash

# Stop the script if any command fails
set -e

# Delete all tables
echo "Deleting all tables..."
ts-node ../backend/other/database_drop_all_tables.ts

# Run migrations
echo "Running migrations..."
"yes" | npm run migrate 

# Initialize Meilisearch indexes
echo "Initializing Meilisearch indexes..."
ts-node ../backend/other/meilisearch_purge_everything_script.ts

echo "All operations completed successfully."
