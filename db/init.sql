DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'root') THEN
        CREATE USER root WITH SUPERUSER PASSWORD '1234';
    END IF;
END $$;

\c postgres

-- Drop the database if it exists, then recreate it
DROP DATABASE IF EXISTS chess_db;
CREATE DATABASE chess_db;

\c chess_db

-- Create the games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    result CHAR(1) CHECK (result IN ('w', 'b', 'd'))
    white_elo INT,
    black_elo INT,
    moves TEXT,
);

-- Load data from the CSV file into the games table
COPY games(result, white_elo, black_elo, moves)
    FROM '/docker-entrypoint-initdb.d/my_games.csv'
    DELIMITER ','
    CSV HEADER;
