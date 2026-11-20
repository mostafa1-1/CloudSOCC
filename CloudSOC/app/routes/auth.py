from flask import Blueprint, jsonify, render_template, request, session
import bcrypt
from app.extensions import db
from app.models import Role, User
from app.security.auth import login_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    data = request.get_json(silent=True) or request.form
    identifier = str(data.get("identifier", "")).strip().lower()
    password = str(data.get("password", ""))
    user = User.query.filter((User.email == identifier) | (User.username == identifier)).first()
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return jsonify({"error": "Invalid credentials"}), 401
    session["user_id"] = user.id
    session["username"] = user.username
    session["role"] = user.role.name
    return jsonify({"username": user.username, "role": user.role.name})


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    session.clear()
    return jsonify({"ok": True})
