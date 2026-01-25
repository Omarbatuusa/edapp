docker exec -u postgres edapp-postgres-1 psql -U edapp -d edapp -c "ALTER USER edapp WITH PASSWORD 'password123';"
