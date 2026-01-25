docker exec edapp-postgres-1 sed -i "s/scram-sha-256/trust/g" /var/lib/postgresql/data/pg_hba.conf
docker exec edapp-postgres-1 sed -i "s/md5/trust/g" /var/lib/postgresql/data/pg_hba.conf
cd /opt/edapp && docker compose restart postgres
sleep 10
docker exec -u postgres edapp-postgres-1 psql -U edapp -c "ALTER USER edapp WITH PASSWORD 'password123';"
docker exec edapp-postgres-1 sed -i "s/trust/scram-sha-256/g" /var/lib/postgresql/data/pg_hba.conf
cd /opt/edapp && docker compose restart postgres
cd /opt/edapp && docker compose restart api
