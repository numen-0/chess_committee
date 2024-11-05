# how to do stuff

```bash
# generate the img
sudo docker run -d --name db-1 -p 5432:5432 postgres-chess-db

sudo docker ps
# sudo docker ps -a

# go in to the stuff
sudo docker exec -it db-1 psql -U numen -d chess_db

# fuck it
sudo docker stop db-1
sudo docker rm db-1
```

# datasets
## Chess Game Dataset (Liches)
20.000+ Lichess Games, including moves, victor, rating, opening details and more

[dataset](https://www.kaggle.com/datasets/datasnaek/chess)

### stats
```bash
# [head]
head games.csv -n 1
# id,rated,created_at,last_move_at,turns,victory_status,winner,increment_code,white_id,white_rating,black_id,black_rating,moves,opening_eco,opening_name,opening_ply

# we can reduce the data to
#   game_elo:      (white_rating+black_rating)/2
#   white_result:  white_result (but just win/lose/draw)
#   moves:         moves
./transform

# games ###############
wc -l games.csv 
# 20059 games.csv

# size ################
du -h games.csv
# 7.4M games.csv

# av. elo #############
echo $(($(tail -n +2 games.csv | cut -d , -f10,12 | awk -F, '{sum += $1 + $2} END {print sum}') / (2 * $(($(cat games.csv | wc -l) - 1)))))
# 1592
```

## Chess Games
6.2 Million chess games played on LiChess

[dataset](https://www.kaggle.com/datasets/arevel/chess-games)

games:      6.250.000
size:       4,38 GB
av. rating: 1600-1800

## Grand Master Chess.com Games Database 2021
Games database of titled players on chess.com platform throughout 2021.
