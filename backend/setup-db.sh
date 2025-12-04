#!/bin/bash

echo "Setting up PostgreSQL database for BlockVOTE..."

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
sudo systemctl start postgresql

# Wait a moment for service to start
sleep 2

# Create database using existing credentials
echo "Creating blockvote database..."
PGPASSWORD=theskysid psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS blockvote;" 2>/dev/null || sudo -u postgres psql -c "DROP DATABASE IF EXISTS blockvote;"
PGPASSWORD=theskysid psql -U postgres -h localhost -c "CREATE DATABASE blockvote;" 2>/dev/null || sudo -u postgres psql -c "CREATE DATABASE blockvote;"

echo "Database setup complete!"
echo "Database: blockvote"
echo "Username: postgres"
echo "Password: theskysid"
echo "Port: 5432"
echo ""
echo "Verifying database..."
PGPASSWORD=theskysid psql -U postgres -h localhost -l | grep blockvote || sudo -u postgres psql -l | grep blockvote

