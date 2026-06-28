import csv
import os

os.makedirs("output", exist_ok=True)

headers = [
    "evidence_type_name",
    "evidence_type_code",
    "description",
    "is_active"
]

rows = [
    ["Photograph", "ET001", "Crime scene photographs", "true"],
    ["Video", "ET002", "Video recordings", "true"],
    ["Fingerprint", "ET003", "Fingerprint evidence", "true"],
    ["DNA Sample", "ET004", "DNA evidence", "true"],
    ["Weapon", "ET005", "Recovered weapons", "true"],
    ["Document", "ET006", "Official documents", "true"],
    ["Mobile Phone", "ET007", "Mobile devices", "true"],
    ["Laptop", "ET008", "Computer devices", "true"],
    ["CCTV Footage", "ET009", "Surveillance footage", "true"],
    ["Other", "ET010", "Miscellaneous evidence", "true"]
]

with open(
    "output/EvidenceType.csv",
    "w",
    newline="",
    encoding="utf-8"
) as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)

print("✓ EvidenceType.csv created")
