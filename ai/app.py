from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from psycopg2 import OperationalError

import time
from collections import Counter
from enum import Enum


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


def read_secret(secret_name):
    try:
        with open(f"/run/secrets/{secret_name}", "r") as file:
            return file.read().strip()
    except FileNotFoundError:
        raise FileNotFoundError(f"Secret file {secret_name} not found")


DB_HOST = "db"
DB_NAME = read_secret("POSTGRES_DB")
DB_USER = read_secret("POSTGRES_USER")
DB_PASSWORD = read_secret("POSTGRES_PASSWORD")
db_connection = None
db_size = 1


def connect_to_db():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    return conn


def get_db_connection():
    global db_connection
    try:
        if db_connection is None or db_connection.closed != 0:
            db_connection = connect_to_db()
    except Exception as e:
        print("error:", e)
        print("Database connection lost. Reconnecting...")
        db_connection = connect_to_db()
    return db_connection


@app.route("/generate_moves", methods=["POST"])
def generate_move():
    req_data = request.json
    moves_start = req_data.get("moves_start")
    top_moves = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query games where the moves column starts with the provided string
        cursor.execute("""
            SELECT moves
            FROM games
            WHERE moves LIKE %s;
        """, (moves_start + '%',))

        games = cursor.fetchall()

        next_moves = []
        for (moves,) in games:
            remaining_moves = moves[len(moves_start):].strip().split(" ")
            if len(remaining_moves) > 0:
                next_moves.append(remaining_moves[0])

        move_counts = Counter(next_moves).most_common(5)

        top_moves = [
            {"move": move, "count": count} for move, count in move_counts
        ]

        cursor.close()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    global db_size
    return jsonify({"top_moves": top_moves, "db_size": db_size})


@app.route("/game_end", methods=["POST"])
def game_end():
    req_data = request.json
    moves = req_data.get("moves")

    if not moves:
        return jsonify({"error": "Missing required field: moves"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert the moves into the table
        cursor.execute(
            """
            INSERT INTO games (moves)
            VALUES (%s);
            """,
            (moves,)
        )

        conn.commit()
        cursor.close()

        return jsonify({"message": "Game saved successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


class Piece(Enum):
    P = 0b000
    N = 0b001
    B = 0b010
    R = 0b011
    Q = 0b100
    K = 0b101


class Color(Enum):
    W = 0b0000
    B = 0b1000


fen_map = {
    "p": Color.B.value | Piece.P.value,
    "n": Color.B.value | Piece.N.value,
    "b": Color.B.value | Piece.B.value,
    "r": Color.B.value | Piece.R.value,
    "q": Color.B.value | Piece.Q.value,
    "k": Color.B.value | Piece.K.value,
    "P": Color.W.value | Piece.P.value,
    "N": Color.W.value | Piece.N.value,
    "B": Color.W.value | Piece.B.value,
    "R": Color.W.value | Piece.R.value,
    "Q": Color.W.value | Piece.Q.value,
    "K": Color.W.value | Piece.K.value,
}

hex_map = [0xa, 0xb, 0xa, 0xd, 0x1, 0xd, 0xe, 0xa]


@app.route('/encode_board', methods=['POST'])
def encode_board():
    # rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
    # | pieces | color | caltle | noEnpeasant | half moves | turn
    req_data = request.json
    fen = req_data.get("fen")

    encoding = 0x00  # bit_map(8*8b=8byte) + pice_queue(32*4b=16byte) = 24byte
    bit_map = 0x00   # remenber to delete this at the end
    pice_queue = 0
    i = 0

    for char in fen.split()[0]:
        if char == "/":
            continue
        elif char.isdigit():
            bit_map <<= int(char)
        else:
            val = fen_map.get(char)
            if val is None:
                return jsonify({"error": f"Invalid FEN character: {char}"}), 400
            bit_map = (bit_map << 1) | 1
            i += 1
            pice_queue = (pice_queue << 4) | val

    for j in range(i, 32):
        pice_queue = (pice_queue << 4) | hex_map[j % 8]

    encoding = (bit_map << 16 * 8) | pice_queue
    # encoding = (bit_map << 16 * 8) | (pice_queue << (32 - i) * 4)

    hex_str = f"{encoding:0{48}x}"
    hex_str = "_".join(hex_str[i:i + 4] for i in range(0, len(hex_str), 4))

    return jsonify({
        "encoding": f"0x{hex_str}"
    })


if __name__ == "__main__":
    while db_connection is None:
        try:
            db_connection = connect_to_db()
            print("Connected to the database successfully.")

            cursor = db_connection.cursor()
            cursor.execute("""
                SELECT count(*) FROM games;
            """)
            db_size = int(cursor.fetchone()[0])

            cursor.close()
        except OperationalError as e:
            print(f"Connection failed: {e}. Retrying in 1 second...")
            time.sleep(1)
    app.run(host="0.0.0.0", port=5002)
