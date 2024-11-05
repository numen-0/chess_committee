from flask import Flask, jsonify, request
from flask_cors import CORS  # cross-origin request fix
import chess
import random

app = Flask(__name__)

# Allow only your front-end origin
CORS(app)
# CORS(app, origins=["http://localhost:5000"])
# CORS(app, resources={r"/*": {"origins": "http://localhost:5000"}})

# In-memory storage for boards, keyed by game_id
boards = {}


@app.route('/remove_game/<game_id>', methods=['POST'])
def remove_game(game_id):
    boards.pop(game_id)


@app.route('/create_game', methods=['POST'])
def create_game():
    # Simple game ID based on the number of existing games
    game_id = str(len(boards) + 1)
    boards[game_id] = (chess.Board(), [])
    return jsonify({"game_id": game_id, "board_moves": ""})


@app.route('/check_move/<game_id>', methods=['POST'])
def check_move(game_id):
    if game_id not in boards:
        return jsonify({"valid": False, "reason": "Game not found."})

    board, san_moves = boards[game_id]
    move_data = request.json  # Expects {"from": "e2", "to": "e4"}
    from_square = move_data.get("from")
    to_square = move_data.get("to")

    try:
        move = chess.Move.from_uci(f"{from_square}{to_square}")
        if move in board.legal_moves:
            san_move = board.san(move)  # Get the SAN notation of the move
            board.push(move)  # Make the move if valid
            san_moves.append(san_move)  # Add the SAN move to the history
            is_valid = True
            reason = "Valid move"
        else:
            is_valid = False
            reason = "Invalid move: This move is not allowed."
    except Exception as e:
        is_valid = False
        reason = f"Error processing move: {str(e)}"

    return jsonify({
        "valid": is_valid,
        "reason": reason,
        "board_moves": " ".join(san_moves)
    })


@app.route('/random_move/<game_id>', methods=['GET'])
def random_move(game_id):
    if game_id not in boards:
        return jsonify({"valid": False, "reason": "Game not found."})

    board, san_moves = boards[game_id]

    if board.is_game_over():
        return jsonify({"valid": False, "reason": "Game is over."})

    move = random.choice(list(board.legal_moves))

    # NOTE: it's ugly but we send the move to get it back to check_move :)
    return jsonify({
        "move": move.uci(),
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

