import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
SUSPECT_FILE = "data/Table-Suspect.csv"
EMPLOYEE_FILE = "data/Table-Employee.csv"

OUTPUT_FILE = "output/ArrestSurrender.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)
suspects = load_csv(SUSPECT_FILE)
employees = load_csv(EMPLOYEE_FILE)

headers = [
    "case_rowid",
    "accused_rowid",
    "arrest_type",
    "arrest_datetime",
    "arrest_location",
    "arresting_officer_rowid",
    "remarks"
]

rows = []

types = [
    "Arrest",
    "Surrender",
    "Preventive Arrest"
]

for suspect in suspects:

    officer = random.choice(employees)

    arrest_time = fake.date_time_between(
        start_date="-2y",
        end_date="now"
    )

    rows.append([
        suspect["case_rowid"],
        suspect["ROWID"],
        random.choice(types),
        arrest_time.strftime("%Y-%m-%d %H:%M:%S"),
        fake.city(),
        officer["ROWID"],
        fake.sentence(nb_words=10)
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

print(f"✓ ArrestSurrender.csv created ({len(rows)} records)")