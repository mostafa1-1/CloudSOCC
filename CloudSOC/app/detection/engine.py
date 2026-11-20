from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass
class RuleConfig:
    id: int
    rule_code: str
    name: str
    event_type_target: str
    threshold: int
    time_window_minutes: int
    severity: str
    is_enabled: bool = True


@dataclass
class EventItem:
    id: int
    timestamp: datetime
    source_ip: str
    username: str
    event_type: str
    severity: str


@dataclass
class ActiveAlertItem:
    rule_id: int
    source_ip: str
    target_username: str
    status: str
    window_end: datetime


@dataclass
class RuleMatch:
    rule: RuleConfig
    title: str
    description: str
    explanation: str
    severity: str
    source_ip: str
    target_username: str
    event_count: int
    window_start: datetime
    window_end: datetime


def _has_active_alert(
    active_alerts: list[ActiveAlertItem],
    rule_id: int,
    source_ip: str,
    target_username: str,
    event_ts: datetime,
    window_minutes: int,
) -> bool:
    delta = timedelta(minutes=window_minutes)
    for alert in active_alerts:
        if alert.rule_id != rule_id:
            continue
        if alert.status in ("Resolved", "False Positive"):
            continue
        same_target = (source_ip and alert.source_ip == source_ip) or (
            target_username and alert.target_username == target_username
        )
        if same_target and abs(event_ts - alert.window_end) <= delta:
            return True
    return False


def evaluate_rules(
    incoming_event: EventItem,
    recent_events: list[EventItem],
    rules: list[RuleConfig],
    active_alerts: list[ActiveAlertItem],
    allowlisted_ips: set[str] | None = None,
    malicious_ips: dict[str, tuple[int, str, str]] | None = None,
) -> list[RuleMatch]:
    allowlisted = allowlisted_ips or set()
    if incoming_event.source_ip in allowlisted:
        return []

    bad_ips = malicious_ips or {}
    matches: list[RuleMatch] = []
    event_ts = incoming_event.timestamp
    if event_ts.tzinfo is None:
        event_ts = event_ts.replace(tzinfo=timezone.utc)

    for rule in rules:
        if not rule.is_enabled:
            continue
        window_delta = timedelta(minutes=max(1, rule.time_window_minutes))
        window_start = event_ts - window_delta

        in_window = [
            ev
            for ev in recent_events
            if window_start <= (ev.timestamp if ev.timestamp.tzinfo else ev.timestamp.replace(tzinfo=timezone.utc)) <= event_ts
        ]

        if rule.rule_code == "RULE-001" and incoming_event.event_type == "Failed Login":
            ip_fails = [e for e in in_window if e.event_type == "Failed Login" and e.source_ip == incoming_event.source_ip]
            user_fails = [
                e
                for e in in_window
                if e.event_type == "Failed Login"
                and incoming_event.username
                and e.username == incoming_event.username
            ]
            peak = max(len(ip_fails), len(user_fails))
            if peak >= rule.threshold and not _has_active_alert(
                active_alerts,
                rule.id,
                incoming_event.source_ip,
                incoming_event.username,
                event_ts,
                rule.time_window_minutes,
            ):
                matches.append(
                    RuleMatch(
                        rule=rule,
                        title=f"Brute-Force Attempt Detected from {incoming_event.source_ip}",
                        description=(
                            f"{peak} failed login attempts observed within {rule.time_window_minutes} minutes "
                            f"targeting account '{incoming_event.username}'."
                        ),
                        explanation=(
                            f"Rule {rule.rule_code} triggered because {peak} failed login events met/exceeded "
                            f"threshold {rule.threshold} in {rule.time_window_minutes} min."
                        ),
                        severity=rule.severity,
                        source_ip=incoming_event.source_ip,
                        target_username=incoming_event.username,
                        event_count=peak,
                        window_start=window_start,
                        window_end=event_ts,
                    )
                )

        elif rule.rule_code == "RULE-002" and incoming_event.event_type == "Failed Login":
            ip_fails = [e for e in in_window if e.event_type == "Failed Login" and e.source_ip == incoming_event.source_ip]
            if rule.threshold <= len(ip_fails) < 10 and not _has_active_alert(
                active_alerts,
                rule.id,
                incoming_event.source_ip,
                incoming_event.username,
                event_ts,
                rule.time_window_minutes,
            ):
                matches.append(
                    RuleMatch(
                        rule=rule,
                        title=f"Repeated Authentication Failures ({incoming_event.source_ip})",
                        description=f"{len(ip_fails)} repeated failures detected for '{incoming_event.username}'.",
                        explanation=f"Rule {rule.rule_code} detected {len(ip_fails)} failed attempts in {rule.time_window_minutes} min.",
                        severity=rule.severity,
                        source_ip=incoming_event.source_ip,
                        target_username=incoming_event.username,
                        event_count=len(ip_fails),
                        window_start=window_start,
                        window_end=event_ts,
                    )
                )

        elif rule.rule_code == "RULE-003" and incoming_event.event_type == "Unauthorized Access":
            probes = [
                e for e in in_window if e.event_type == "Unauthorized Access" and e.source_ip == incoming_event.source_ip
            ]
            if len(probes) >= rule.threshold and not _has_active_alert(
                active_alerts,
                rule.id,
                incoming_event.source_ip,
                incoming_event.username,
                event_ts,
                rule.time_window_minutes,
            ):
                matches.append(
                    RuleMatch(
                        rule=rule,
                        title=f"Unauthorized Access Attempts from {incoming_event.source_ip}",
                        description=f"{len(probes)} unauthorized resource probes blocked.",
                        explanation=f"Rule {rule.rule_code} matched {len(probes)} Unauthorized Access events.",
                        severity=rule.severity,
                        source_ip=incoming_event.source_ip,
                        target_username=incoming_event.username,
                        event_count=len(probes),
                        window_start=window_start,
                        window_end=event_ts,
                    )
                )

        elif rule.rule_code == "RULE-004" and incoming_event.source_ip in bad_ips:
            score, verdict, source = bad_ips[incoming_event.source_ip]
            if verdict in ("Malicious", "Suspicious") and not _has_active_alert(
                active_alerts,
                rule.id,
                incoming_event.source_ip,
                incoming_event.username,
                event_ts,
                rule.time_window_minutes,
            ):
                matches.append(
                    RuleMatch(
                        rule=rule,
                        title=f"Suspicious IP Reputation Activity ({incoming_event.source_ip})",
                        description=f"Activity from flagged IP {incoming_event.source_ip} (Score {score}/100, {verdict}).",
                        explanation=f"Rule {rule.rule_code} matched {incoming_event.source_ip} via {source}.",
                        severity="Critical" if verdict == "Malicious" else rule.severity,
                        source_ip=incoming_event.source_ip,
                        target_username=incoming_event.username,
                        event_count=1,
                        window_start=window_start,
                        window_end=event_ts,
                    )
                )

    return matches
