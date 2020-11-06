from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
app = Flask(__name__)
cors = CORS(app)

@app.route('/playlist/testuser')
@cross_origin()
def playlist():
    return jsonify(
        [
            {"title": "Playlist 1", "date": "1/10/2010"},
            {"title": "Playlist 2", "date": "2/10/2010"},
            {"title": "Playlist 3", "date": "3/10/2010"}
        ]
    )

if __name__ == '__main__':
    app.run()
