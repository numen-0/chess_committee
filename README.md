# Chess Commetee
## Overview

Chess Committee is a chess program powered by AI (Average Intelligence). It
analyzes a dataset of chess games to determine its moves, choosing the most
frequently played move. If no data is available, it defaults to a random legal
move.

The program supports two datasets:
- **Small Dataset** (~20,000 games), lightweight for quick setup and testing.
- **Large Dataset** (+6,000,000 games).

Switch between datasets using the script located at `./db/get_data.sh`. Note,
if you have already build the project you will need to remove the volume 
`db_data`, and rebuild again.

You can switch datasets using the `./db/get_data.sh` script. If you’ve already
built the project, you will need to delete the persistent volume and rebuild for
the changes to take effect.

---

## Prerequisites

- `docker` and `docker-compose`
- `kubectl` and `minikube`
- `curl` and `unzip`
- `sudo` access

## How to Run
### Step 1: Fetch the data
Navigate to the `db` directory and fetch the dataset for the database:
```bash
cd db
# Fetch the small dataset (~20,000 games)
./get_data.sh small

# Alternatively, fetch the large dataset (+6,000,000 games)
# ./get_data.sh big
cd ..
```

### Step 2: Set the secrets
Create a directory for secrets and populate it with the database credentials:
```bash
mkdir ./secrets/
echo "chess_db" > ./secrets/POSTGRES_DB
echo "1234"     > ./secrets/POSTGRES_PASSWORD
echo "root"     > ./secrets/POSTGRES_USER
```
Note: While the above setup is convenient for local development, ensure that
secrets are stored securely in production environments.

### Step 3: Run the program
#### Option 1: docker compose
Run the following command to start the program:
```bash
./run
```

#### Option 2; kubernetes (minikube)
First, initialize Minikube:
```bash
cd ./kubernetes
./init
```

Then, deploy the program using kubectl:
```bash
./run
```

### Step 4: Stop
To stop the program, use the -d flag:
```bash
./run -d
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

