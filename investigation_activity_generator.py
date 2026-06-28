import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
EMPLOYEE_FILE = "data/Table-Employee.csv"
OUTPUT_FILE = "output/InvestigationActivity.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)
employees = load_csv(EMPLOYEE_FILE)

headers = [
    "case_rowid",
    "activity_type",
    "activity_description",
    "activity_datetime",
    "officer_rowid",
    "attachment_url"
]

activity_types = [
    "Crime Scene Visit",
    "Witness Examination",
    "Victim Statement",
    "Suspect Interrogation",
    "Evidence Collection",
    "Forensic Examination",
    "CCTV Analysis",
    "Document Verification",
    "Search Operation",
    "Case Review"
]

rows = []

for case in cases:

    activity_count = random.randint(2, 5)

    for _ in range(activity_count):

        officer = random.choice(employees)

        activity = random.choice(activity_types)

        activity_time = fake.date_time_between(
            start_date="-2y",
            end_date="now"
        )

        rows.append([
            case["ROWID"],
            activity,
            fake.sentence(nb_words=12),
            activity_time.strftime("%Y-%m-%d %H:%M:%S"),
            officer["ROWID"],
            f"https://crimesight.ai/activity/{random.randint(100000,999999)}"
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

print(f"✓ InvestigationActivity.csv created ({len(rows)} records)")