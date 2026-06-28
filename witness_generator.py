import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
OUTPUT_FILE = "output/Witness.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)

headers = [
    "case_rowid",
    "witness_name",
    "phone",
    "email",
    "address",
    "statement",
    "witness_type"
]

rows = []

types = [
    "Eyewitness",
    "Expert Witness",
    "Complainant",
    "Independent Witness",
    "Police Witness"
]

for case in cases:

    witness_count = random.randint(0, 3)

    for _ in range(witness_count):

        rows.append([
            case["ROWID"],
            fake.name(),
            fake.msisdn()[:10],
            fake.email(),
            fake.address().replace("\n", ", "),
            fake.sentence(nb_words=18),
            random.choice(types)
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

print(f"✓ Witness.csv created ({len(rows)} records)")