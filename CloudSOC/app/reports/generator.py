import csv
import io
from app.security.validators import escape_csv_cell


def generate_csv_bytes(columns: list[str], rows: list[dict]) -> bytes:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([escape_csv_cell(col) for col in columns])
    for row in rows:
        writer.writerow([escape_csv_cell(row.get(col, "")) for col in columns])
    return buf.getvalue().encode("utf-8")
