# Chess Commetee
## Overview

Chess Committee is a chess program that uses AI (Average Intelligence) to play
against users. The AI determines its moves by analyzing the most frequently
played move in its dataset. If no data is available, it will choose a random
legal move.

The program supports two datasets:
- **Small Dataset** (~20,000 games): Lightweight for quick setup and testing.
- **Large Dataset** (+6,000,000 games): Ideal for comprehensive analysis and
gameplay.

Switch between datasets using the script located at `./db/get_data.sh`. Note,
if you have already build the proyect you will need to remove the volume 
`db_data`, and rebuild again.

---

## Prerequisites

- `docker` and `docker-compose`
- `sudo` access
- `kubectl` and `minikube`

## How to Run
### Step 1: fetch the data
Requirements:
- `curl`
- `unzip`

```bash
cd db
# fetch the data for the database. do './get_data.sh big' for the large dataset
./get_data.sh small
cd ..
```

### Step 2: set the secrets
To configure secrets for the database, run the following commands:
```bash
mkdir ./secrets/
echo "chess_db" > ./secrets/POSTGRES_DB
echo "1234"     > ./secrets/POSTGRES_PASSWORD
echo "root"     > ./secrets/POSTGRES_USER
```
Note: While the above setup is convenient for local development, ensure that
secrets are stored securely in production environments.

### Step 3: Run
To run the program with `docker-compose`, use the following command:
```bash
sudo docker-compose up -d
```

### Step 4: Stop
To stop the program, use the following command:
```bash
sudo docker-compose down
```

## attributions
### datasets
The datasets are sourced from publicly available chess game archives. Ensure
you comply with the terms of use if you modify or redistribute the data.

### img
white pieces:
- pawn:   By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499810
- king:   By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499806
- queen:  By CburnettPawan (talk • contribs • blocks • protections • deletions • moves • rights • rights changes) - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499812
- rook:   By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499814
- bishop: By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499801
- knight: By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499808

black pieces:
- pawn:   By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499809
- king:   By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499803
- queen:  By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499811
- rook:   By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499813
- bishop: By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499800
- knight: By Cburnett - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=1499807

favicon.ico:
The favicon was generated using the following graphics from Twitter Twemoji:

- Graphics Title: 265f.svg
- Graphics Author: Copyright 2020 Twitter, Inc and other contributors (https://github.com/twitter/twemoji)
- Graphics Source: https://github.com/twitter/twemoji/blob/master/assets/svg/265f.svg
- Graphics License: CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/)

buttons:
- Edit tool icon created by Creatype - Flaticon (https://www.flaticon.com/free-icons/edit-tool)
- Repeat icon created by IconKanan - Flaticon (https://www.flaticon.com/free-icons/repeat)
- Dark mode icon created by Icon Hubs - Flaticon (https://www.flaticon.com/free-icons/dark-mode)

