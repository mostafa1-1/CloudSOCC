from functools import wraps
from flask import abort, session


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            abort(401)
        return fn(*args, **kwargs)
    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            abort(401)
        if session.get("role") != "ADMIN":
            abort(403)
        return fn(*args, **kwargs)
    return wrapper
