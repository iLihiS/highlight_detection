from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

segments = []

@app.route('/api/segments', methods=['POST'])
def save_segment():
    segment = request.json
    segments.append(segment)
    return jsonify(segment), 201

@app.route('/api/segments', methods=['GET'])
def get_segments():
    return jsonify(segments), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4200)
