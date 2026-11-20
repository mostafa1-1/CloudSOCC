import ipaddress
import re
from urllib.parse import urlparse

DOMAIN_RE = re.compile(r"^(?=.{3,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$")
HASH_RE = re.compile(r"^(?:[a-fA-F0-9]{32}|[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$")
USERNAME_RE = re.compile(r"^[a-zA-Z0-9._-]{3,32}$")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")


def is_valid_ipv4(value: str) -> bool:
    try:
        ipaddress.IPv4Address(value.strip())
        return True
    except ValueError:
        return False


def is_valid_domain(value: str) -> bool:
    return bool(DOMAIN_RE.match(value.strip()))


def is_valid_url(value: str) -> bool:
    try:
        parsed = urlparse(value.strip())
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except ValueError:
        return False


def is_valid_hash(value: str) -> bool:
    return bool(HASH_RE.match(value.strip()))


def validate_password_strength(password: str) -> tuple[bool, str]:
    if not isinstance(password, str) or len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not (re.search(r"[A-Z]", password) and re.search(r"[a-z]", password) and re.search(r"[0-9]", password)):
        return False, "Password must contain uppercase, lowercase, and numeric characters."
    return True, ""


def redact_sensitive_fields(text: str) -> str:
    return re.sub(r"(password|passwd|pwd|secret|token)\s*[:=]\s*\S+", r"\1=[REDACTED]", text, flags=re.IGNORECASE)


def escape_csv_cell(value) -> str:
    s = str(value if value is not None else "")
    if s.startswith(("=", "+", "-", "@")):
        s = "'" + s
    return s
