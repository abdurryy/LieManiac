from flask import Flask, render_template, session, url_for, request, redirect, flash, jsonify
import json
import random
import os

app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
current_sessions = []

def auth():
    return 'username' in session

@app.route("/")
def home():
    if not auth():
        return redirect(url_for('pick'))
    return render_template("index.html", username=session["username"])

@app.route("/pick/username", methods=['GET', 'POST'])
def pick():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        if not username:
            flash("Please enter a valid username.")
            return redirect(url_for('pick'))
        
        session['username'] = username + str(random.randint(1000, 9999))
        return redirect(url_for('home'))
    return render_template('username.html')

@app.route("/create", methods=['POST'])
def create():
    game_id = str(random.randint(100000, 999999))
    current_sessions.append({"game_id": game_id, "players": [], "question":"", "imposter_question":"", "imposter_player":"", "submissions": [], "status": "Lobby", "started":False})
    return game_id

@app.route("/host/<game_id>", methods=['GET'])
def host(game_id):
    return render_template('host.html', game_id=game_id)

@app.route("/get_players/<game_id>", methods=['POST'])
def get_players(game_id):
    for s in current_sessions:
        if s["game_id"] == game_id:
            return s["players"]
    return render_template('host.html', game_id=game_id)

@app.route("/join", methods=['POST'])
def join():
    game_id = request.form.get("code", "").strip()
    game = next((g for g in current_sessions if g["game_id"] == game_id), None)
    
    if game:
        for pla in game["players"]:
            if pla == session["username"]:
                return redirect(url_for("game", game_id=game_id))
        game["players"].append(session["username"])
        return redirect(url_for("game", game_id=game_id))
    else:
        flash("Invalid game code.")
        return redirect(url_for("home"))
    
@app.route("/updatestate", methods=['POST'])
def updatestate():
    game_id = request.json["game_id"].strip()
    state = request.json["state"].strip()
    game = next((g for g in current_sessions if g["game_id"] == game_id), None)
    game["status"] = state
    return jsonify({"state":game["status"]})


@app.route("/submission", methods=['POST'])
def submission():
    game_id = request.json["game_id"].strip()
    username = request.json["username"].strip()
    xsubmission = request.json["submission"].strip()
    game = next((g for g in current_sessions if g["game_id"] == game_id), None)
    for submission in game["submissions"]:
        if submission["username"] == username:
            return jsonify({"success": 0, "msg": "already submitted"})
    d = {"username": username, "submission": xsubmission}
    game["submissions"].append(d)
    return jsonify({"success": 1, "msg": "submitted", "data" : d})

@app.route("/finished", methods=['POST'])
def finished():
    game_id = request.json["game_id"].strip()
    game = next((g for g in current_sessions if g["game_id"] == game_id), None)
    if len(game["submissions"]) == len(game["players"]):
        return jsonify({
            "submissions": game["submissions"],
            "imposter": game["imposter_player"],
            "question": game["question"],
            "ready": True
        })
    else:
        return jsonify({
            "ready": False
        })

@app.route("/state", methods=['POST'])
def state():
    game_id = request.json["game_id"].strip()
    username = request.json["username"].strip()
    game = next((g for g in current_sessions if g["game_id"] == game_id), None)
    if game is None:
        return jsonify({"state": "no"})
    
    if game["status"] == "question":
        for submission in game["submissions"]:
            if submission["username"] == username:
                return jsonify({"state":None})
        if username == game["imposter_player"]:
            return jsonify({"state":"question", "question": game["imposter_question"]})
        return jsonify({"state":"question","question": game["question"]})
    
    return jsonify({"state":game["status"]})

@app.route("/genquestion", methods=['POST'])
def question():
    game_id = request.json["game_id"].strip()
    game = next((g for g in current_sessions if g["game_id"] == game_id), None)
    game["imposter_player"] = random.choice(game["players"])
    with open('db/questions.json', 'r', encoding="utf-8") as f:
        questions = json.load(f)
    q = random.choice(questions)
    game["question"] = q["question"]
    game["imposter_question"] = random.choice(q["imposter_questions"])
    game["submissions"] = []
    game["status"] = "question"
    return jsonify({"question": q["question"]})
    


@app.route("/game/<game_id>", methods=['GET'])
def game(game_id):
    return render_template('game.html', game_id=game_id, username=session["username"])