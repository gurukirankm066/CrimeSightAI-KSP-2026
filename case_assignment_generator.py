import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
EMPLOYEE_FILE = "data/Table-Employee.csv"

OUTPUT_FILE = "output/CaseAssignment.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)
employees = load_csv(EMPLOYEE_FILE)

headers = [
    "case_rowid",
    "assigned_to_rowid",
    "assigned_by_rowid",
    "assigned_datetime",
    "assignment_status",
    "remarks"
]

statuses = [
    "Assigned",
    "In Progress",
    "Reassigned",
    "Completed"
]

rows = []

for case in cases:

    assigned_to = random.choice(employees)
    assigned_by = random.choice(employees)

    assigned_time = fake.date_time_between(
        start_date="-2y",
        end_date="now"
    )

    rows.append([
        case["ROWID"],
        assigned_to["ROWID"],
        assigned_by["ROWID"],
        assigned_time.strftime("%Y-%m-%d %H:%M:%S"),
        random.choice(statuses),
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

print(f"✓ CaseAssignment.csv created ({len(rows)} records)")