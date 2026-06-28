import csv
import os
import random
from faker import Faker
from datetime import datetime

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
TYPE_FILE = "data/Table-EvidenceType.csv"
EMPLOYEE_FILE = "data/Table-Employee.csv"

OUTPUT_FILE = "output/Evidence.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)
types = load_csv(TYPE_FILE)
employees = load_csv(EMPLOYEE_FILE)

headers = [
    "case_rowid",
    "evidence_type_rowid",
    "evidence_name",
    "description",
    "file_url",
    "collected_by_rowid",
    "collection_datetime",
    "chain_of_custody",
    "forensic_status"
]

rows = []
evidence_names = [
    "Crime Scene Photograph",
    "CCTV Footage",
    "Fingerprint Sample",
    "DNA Sample",
    "Knife",
    "Mobile Phone",
    "Laptop",
    "Blood Sample",
    "Vehicle",
    "Document"
]

for case in cases:

    evidence_count = random.randint(1, 4)

    for _ in range(evidence_count):

        evidence_type = random.choice(types)
        collector = random.choice(employees)

        collected_time = fake.date_time_between(
            start_date="-2y",
            end_date="now"
        )

        rows.append([
            case["ROWID"],
            evidence_type["ROWID"],
            random.choice(evidence_names),
            fake.sentence(nb_words=10),
            f"https://crimesight.ai/evidence/{random.randint(100000,999999)}",
            collector["ROWID"],
            collected_time.strftime("%Y-%m-%d %H:%M:%S"),
            random.choice([
                "Collected",
                "Transferred to FSL",
                "Stored in Evidence Room",
                "Presented in Court"
            ]),
            random.choice([
                "Pending",
                "Under Examination",
                "Completed",
                "Matched",
                "Not Matched"
            ])
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

print(f"✓ Evidence.csv created ({len(rows)} records)")