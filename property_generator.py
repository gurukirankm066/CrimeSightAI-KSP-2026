import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
OUTPUT_FILE = "output/Property.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)

headers = [
    "case_rowid",
    "property_name",
    "property_type",
    "estimated_value",
    "recovered_status",
    "description"
]

property_names = [
    "Gold Chain",
    "Mobile Phone",
    "Laptop",
    "Motorcycle",
    "Car",
    "Cash",
    "Television",
    "Watch",
    "Jewellery",
    "Documents"
]

property_types = [
    "Jewellery",
    "Electronics",
    "Vehicle",
    "Cash",
    "Documents",
    "Household Item"
]

rows = []

for case in cases:

    property_count = random.randint(0, 3)

    for _ in range(property_count):

        rows.append([
            case["ROWID"],
            random.choice(property_names),
            random.choice(property_types),
            round(random.uniform(1000, 500000), 2),
            random.choice(["true", "false"]),
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

print(f"✓ Property.csv created ({len(rows)} records)")