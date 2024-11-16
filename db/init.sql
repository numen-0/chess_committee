CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    moves TEXT
);

COPY games(moves)
    FROM '/docker-entrypoint-initdb.d/data.csv'
    DELIMITER ','
    CSV HEADER;

