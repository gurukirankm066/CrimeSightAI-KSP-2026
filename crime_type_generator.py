import csv
import os

os.makedirs("output", exist_ok=True)

headers = [
    "crime_type_name",
    "crime_type_code",
    "description",
    "is_active"
]

rows = [
    ["Murder", "CT001", "Offences causing death", "true"],
    ["Theft", "CT002", "Property theft", "true"],
    ["Robbery", "CT003", "Robbery offences", "true"],
    ["Burglary", "CT004", "House breaking", "true"],
    ["Assault", "CT005", "Physical assault", "true"],
    ["Cyber Crime", "CT006", "Cyber related offences", "true"],
    ["Fraud", "CT007", "Financial fraud", "true"],
    ["Drug Offence", "CT008", "Narcotics offences", "true"],
    ["Traffic Offence", "CT009", "Traffic violations", "true"],
    ["Missing Person", "CT010", "Missing person cases", "true"]
]

with open(
    "output/CrimeType.csv",
    "w",
    newline="",
    encoding="utf-8"
) as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)

print("✓ CrimeType.csv created")