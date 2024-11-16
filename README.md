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

Switch between datasets using the script located at `./db/get_data.sh`.

---

## Prerequisites

- `docker` and `docker-compose`
- `sudo` access

## How to Run
### Step 1: fetch the data
Requirements:
- `curl`
- `unzip`

```bash
cd db
# fetch the data for the database.
# adjust the dataset size in 'dataset' variable within the script.
./get_data.sh
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
#### option 1: Using Docker Compose Directly

To run the program with `docker-compose`, use the following command:
```bash
sudo docker-compose up --build -d
```

#### option 2: Using the Helper Script
For a more convenient way to run the program, use the bob script. This script:
- Opens a new terminal to run the `docker-compose up --build` command, so you
retain control of your current terminal.
- Automatically kills any previous instance of the application, allowing for
easy re-runs when you make changes.

```bash
./bob
```

##### Optional: Using a Password File
If you prefer to avoid typing your sudo password each time you run the script,
create a `./PASSWORD` file containing your sudo password.

### Terminal Compatibility
The script defaults to the `st` terminal. If you use a different terminal,
update the term variable in the script. You can also add support for additional
terminal emulators by modifying the case statement within the script

## attributions
### datasets
The datasets are sourced from publicly available chess game archives. Ensure
you comply with the terms of use if you modify or redistribute the data.

### assets
`todo`
