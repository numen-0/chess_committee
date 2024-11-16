# Official PostgreSQL image
FROM postgres:13

# Set environment variables for database configuration (optional)
# TODO: move this to secrets??
ENV POSTGRES_USER=root
ENV POSTGRES_PASSWORD=1234
ENV POSTGRES_DB=chess_db

COPY init.sql /docker-entrypoint-initdb.d/
COPY data.csv /docker-entrypoint-initdb.d/

# PostgreSQL port
EXPOSE 5432
