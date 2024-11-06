from flask import Flask, jsonify, request
from flask_cors import CORS  # cross-origin request fix
from enum import Enum


app = Flask(__name__)
# CORS(app, origins=["http://localhost:5000"])
CORS(app, origins=["http://localhost:5000"], supports_credentials=True)


@app.route("/generate_move", methods=["GET"])
def generate_move():
    # Placeholder for AI move generation logic
    return jsonify({"move_uci": "e2e3"})


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
    app.run(host="0.0.0.0", port=5002)

