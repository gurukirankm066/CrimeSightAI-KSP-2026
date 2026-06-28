import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
OUTPUT_FILE = "output/Chargesheet.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)

headers = [
    "case_rowid",
    "filing_date",
    "court_name",
    "judge_name",
    "chargesheet_number",
    "filing_status",
    "document_url"
]

courts = [
    "District & Sessions Court",
    "JMFC Court",
    "Metropolitan Magistrate Court",
    "Civil Court",
    "Fast Track Court",
    "High Court Bench"
]

statuses = [
    "Filed",
    "Pending",
    "Returned for Correction",
    "Accepted"
]

rows = []

for i, case in enumerate(cases, start=1):

    if random.random() < 0.75:

        filing_date = fake.date_between(
            start_date="-2y",
            end_date="today"
        )

        rows.append([
            case["ROWID"],
            filing_date.strftime("%Y-%m-%d"),
            random.choice(courts),
            fake.name(),
            f"CS-{filing_date.year}-{i:05}",
            random.choice(statuses),
            f"https://crimesight.ai/chargesheet/{i}"
        ])

with open(
    OUTPUT_FILE,
    "w",
    newline="",
    encoding="utf-8"
) as f:

    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)

print(f"✓ Chargesheet.csv created ({len(rows)} records)")