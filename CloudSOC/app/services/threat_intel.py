import hashlib
import os
import requests

DEMO_MALICIOUS = {
    "185.220.101.42": (92, "Tor Exit Node / Credential Stuffing"),
    "45.155.205.91": (84, "SSH & Web Auth Brute-Force Scanner"),
}


def lookup_indicator(indicator_type: str, indicator_value: str) -> dict:
    vt_key = os.environ.get("VIRUSTOTAL_API_KEY", "").strip()
    abuse_key = os.environ.get("ABUSEIPDB_API_KEY", "").strip()

    if indicator_type == "ipv4" and abuse_key:
        try:
            resp = requests.get(
                "https://api.abuseipdb.com/api/v2/check",
                headers={"Key": abuse_key, "Accept": "application/json"},
                params={"ipAddress": indicator_value, "maxAgeInDays": 90},
                timeout=6,
            )
            if resp.status_code == 200:
                score = int(resp.json().get("data", {}).get("abuseConfidenceScore", 0))
                verdict = "Malicious" if score >= 75 else "Suspicious" if score >= 25 else "Clean"
                return {
                    "indicator_type": indicator_type,
                    "indicator_value": indicator_value,
                    "reputation_score": score,
                    "verdict": verdict,
                    "source": "AbuseIPDB",
                    "demo_mode": False,
                }
        except requests.RequestException:
            pass

    if vt_key:
        try:
            path_map = {
                "ipv4": f"ip_addresses/{indicator_value}",
                "domain": f"domains/{indicator_value}",
                "hash": f"files/{indicator_value}",
            }
            if indicator_type in path_map:
                resp = requests.get(
                    f"https://www.virustotal.com/api/v3/{path_map[indicator_type]}",
                    headers={"x-apikey": vt_key},
                    timeout=6,
                )
                if resp.status_code == 200:
                    stats = resp.json().get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                    mal = int(stats.get("malicious", 0))
                    susp = int(stats.get("suspicious", 0))
                    score = min(100, mal * 12 + susp * 5)
                    verdict = "Malicious" if mal >= 3 else "Suspicious" if (mal > 0 or susp > 0) else "Clean"
                    return {
                        "indicator_type": indicator_type,
                        "indicator_value": indicator_value,
                        "reputation_score": score,
                        "verdict": verdict,
                        "source": "VirusTotal",
                        "demo_mode": False,
                    }
        except requests.RequestException:
            pass

    # Local Demonstration Fallback (clearly labeled)
    if indicator_type == "ipv4" and indicator_value in DEMO_MALICIOUS:
        score, _cat = DEMO_MALICIOUS[indicator_value]
        return {
            "indicator_type": indicator_type,
            "indicator_value": indicator_value,
            "reputation_score": score,
            "verdict": "Malicious",
            "source": "Local Demonstration",
            "demo_mode": True,
        }

    digest = hashlib.sha256(f"{indicator_type}:{indicator_value}".encode()).digest()[0]
    score = 82 if digest >= 215 else 48 if digest >= 165 else 4
    verdict = "Malicious" if score >= 75 else "Suspicious" if score >= 40 else "Clean"
    return {
        "indicator_type": indicator_type,
        "indicator_value": indicator_value,
        "reputation_score": score,
        "verdict": verdict,
        "source": "Local Demonstration",
        "demo_mode": True,
    }
