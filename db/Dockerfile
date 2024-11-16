# Official PostgreSQL image
FROM postgres:13

COPY init.sql /docker-entrypoint-initdb.d/
COPY data.csv /docker-entrypoint-initdb.d/

# PostgreSQL port
EXPOSE 5432
