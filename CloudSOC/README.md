# CloudSOC — Cloud-Based Security Monitoring & Incident Response Platform

Academic Year: 2026 | Course: Cloud Computing | Team: `[TEAM NAME]` (`[TEAM ID]`)

## Overview
CloudSOC is a modular, cloud-hosted Security Operations Center (SOC) simulation platform built to demonstrate practical Cloud Computing concepts (Scalability, Availability, Cloud Storage, Cloud Database, Cloud Security, and Monitoring) through defensive cybersecurity operations.

## Dual-Delivery Repository Note
- **Python/Flask Reference & Deployment Codebase (`/CloudSOC/`)**: Implements the university's preferred Python, Flask, SQLAlchemy, PostgreSQL, Bootstrap 5, and Chart.js architecture with Alembic/SQL migrations, Gunicorn WSGI entrypoint, and `unittest`/`pytest` test suites.
- **Live Interactive AI Studio Runtime (`/server.ts` + `/src/`)**: Runs on Node.js 22 (`Express` + `node:sqlite` + `React` + `Chart.js` + `Tailwind CSS`) inside the container environment where `pip` and PostgreSQL daemon are unavailable, preserving identical REST semantics, 11-table relational schema, bcrypt password hashing, CSRF protection, and rule-based detection logic.

## Quick Start (Python / PostgreSQL)
```bash
cd CloudSOC
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Apply PostgreSQL schema: psql "$DATABASE_URL" -f migrations/001_initial_postgresql.sql
python3 run.py
```

## Running Tests
```bash
python3 -m unittest discover -s tests -p "test_*.py" -v
```
