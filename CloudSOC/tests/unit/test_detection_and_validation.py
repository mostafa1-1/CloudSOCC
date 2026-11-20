from datetime import datetime, timedelta, timezone
import unittest
from app.detection.engine import ActiveAlertItem, EventItem, RuleConfig, evaluate_rules
from app.security.validators import (
    escape_csv_cell,
    is_valid_domain,
    is_valid_hash,
    is_valid_ipv4,
    is_valid_url,
    redact_sensitive_fields,
    validate_password_strength,
)


class TestCloudSOCPythonEngine(unittest.TestCase):
    def setUp(self):
        self.base_time = datetime(2026, 11, 19, 12, 0, 0, tzinfo=timezone.utc)
        self.rules = [
            RuleConfig(1, "RULE-001", "Brute Force", "Failed Login", 10, 5, "Critical", True),
            RuleConfig(2, "RULE-002", "Repeated Failures", "Failed Login", 4, 10, "High", True),
            RuleConfig(3, "RULE-003", "Unauthorized Probe", "Unauthorized Access", 2, 15, "High", True),
            RuleConfig(4, "RULE-004", "Bad IP Reputation", "*", 1, 60, "High", True),
        ]

    def test_brute_force_triggers_critical_alert(self):
        events = [
            EventItem(i, self.base_time - timedelta(seconds=(10 - i) * 15), "203.0.113.50", "jdoe", "Failed Login", "Medium")
            for i in range(1, 11)
        ]
        matches = evaluate_rules(events[-1], events, self.rules, [])
        self.assertTrue(any(m.rule.rule_code == "RULE-001" and m.severity == "Critical" for m in matches))

    def test_deduplication_prevents_duplicate_alerts(self):
        events = [
            EventItem(i, self.base_time - timedelta(seconds=(11 - i) * 10), "203.0.113.50", "jdoe", "Failed Login", "Medium")
            for i in range(1, 12)
        ]
        active = [ActiveAlertItem(1, "203.0.113.50", "jdoe", "New", self.base_time)]
        matches = evaluate_rules(events[-1], events, self.rules, active)
        self.assertFalse(any(m.rule.rule_code == "RULE-001" for m in matches))

    def test_allowlist_skips_false_positives(self):
        events = [
            EventItem(i, self.base_time - timedelta(seconds=i * 10), "10.0.0.5", "admin", "Failed Login", "Medium")
            for i in range(1, 5)
        ]
        matches = evaluate_rules(events[-1], events, self.rules, [], allowlisted_ips={"10.0.0.5"})
        self.assertEqual(len(matches), 0)

    def test_validators_and_redaction(self):
        self.assertTrue(is_valid_ipv4("185.220.101.42"))
        self.assertFalse(is_valid_ipv4("999.999.1.1"))
        self.assertTrue(is_valid_domain("cloudsoc.example.edu"))
        self.assertTrue(is_valid_url("https://cloudsoc.example.edu/login"))
        self.assertFalse(is_valid_url("javascript:alert(1)"))
        self.assertTrue(is_valid_hash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"))
        self.assertFalse(validate_password_strength("weak")[0])
        self.assertTrue(validate_password_strength("Strong@2026")[0])
        self.assertEqual(escape_csv_cell("=SUM(A1:A2)"), "'=SUM(A1:A2)")
        self.assertNotIn("TopSecret99", redact_sensitive_fields("Attempt password=TopSecret99 failed"))


if __name__ == "__main__":
    unittest.main()
