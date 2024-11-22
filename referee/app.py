from flask import Flask, jsonify, request
from flask_cors import CORS  # cross-origin request fix
import chess
import random

app = Flask(__name__)
# CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
# CORS(app, origins=["http://server", "http://localhost"])
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route('/create_game', methods=['GET'])
def create_game():
    board = chess.Board()
    return jsonify({
        "board_moves": "",
        "fen": board.fen(en_passant="fen")
    })


@app.route('/check_move', methods=['POST'])
def check_move():
    try:
        # Expects {from: "e2", to: "e4", fen: "..."}
        req_data = request.json
        from_square = req_data.get("from")
        to_square = req_data.get("to")

        board = chess.Board(fen=req_data.get("fen"))
        move = chess.Move.from_uci(f"{from_square}{to_square}")
        if move in board.legal_moves:
            san_move = board.san(move)  # Get the SAN notation of the move
            board.push(move)  # Make the move if valid
            is_valid = True
            reason = "Valid move"
            fen = board.fen(en_passant="fen")
        else:
            is_valid = False
            reason = "Invalid move: This move is not allowed."
            san_move = ""
            fen = ""
    except Exception as e:
        is_valid = False
        reason = f"Error processing move: {str(e)}"
        san_move = ""
        fen = ""

    return jsonify({
        "valid": is_valid,
        "reason": reason,
        "move": san_move,
        "fen": fen
    })


@app.route('/game_over', methods=['POST'])
def game_over():
    req_data = request.json

    board = chess.Board(fen=req_data.get("fen"))

    isOver = board.is_game_over()
    result = ""
    reason = ""
    if isOver:
        out = board.outcome()
        result = out.result()
        reason = out.termination.name.lower()

    return jsonify({
        "is_over": isOver,
        "result": result,
        "reason": reason
    })


@app.route('/random_move', methods=['POST'])
def random_move():
    req_data = request.json

    board = chess.Board(fen=req_data.get("fen"))

    move = random.choice(list(board.legal_moves))
    board.push(move)  # Make the move if valid

    # NOTE: it's ugly but we send the move to get it back to check_move :)
    return jsonify({
        "move_uci": move.uci(),
    })


@app.route("/san_to_uci", methods=["POST"])
def san_to_uci():
    req_data = request.json

    board = chess.Board(fen=req_data.get("fen"))
    san_move = req_data.get("san_move")

    if not san_move:
        return jsonify({"error": "san_move parameter is required"}), 400

    try:
        move = board.parse_san(san_move)
        if not board.is_legal(move):
            return jsonify({"is_valid": False}), 200

        uci_move = move.uci()
        return jsonify({"is_valid": True, "move_uci": uci_move})

    except Exception as e:
        return jsonify({"error": str(e), "is_valid": False}), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

