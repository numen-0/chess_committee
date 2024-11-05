# Chess Commetee
## Overview
_todo_ Add a brief project overview here, describing what Chess Committee does
and its purpose

## Prerequisites
- `docker` and `docker-compose`
- sudo access

## How to run
1. Using Docker Compose Directly

To run the program with Docker Compose, use the following command:
```bash
sudo docker-compose up --build
```

2. Using the Helper Script
For a more convenient way to run the program, use the bob script. This script:
- Opens a new terminal to run the `docker-compose up --build` command, so you
retain control of your current terminal.
- Automatically kills any previous instance of the application, allowing for
easy re-runs when you make changes.

```bash
./bob
```
### Optional: Using a Password File
If you prefer to avoid typing your sudo password each time you run the script,
create a `./PASSWORD` file containing your sudo password.

### Terminal Compatibility
The script defaults to the `st` terminal. If you use a different terminal,
update the term variable in the script. You can also add support for additional
terminal emulators by modifying the case statement within the script
