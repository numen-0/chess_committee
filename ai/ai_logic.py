from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/generate_move", methods=["GET"])
def generate_move():
    # Placeholder for AI move generation logic
    return jsonify({"move": "e2e4"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)

