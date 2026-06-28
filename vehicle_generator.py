import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
TYPE_FILE = "data/Table-VehicleType.csv"

OUTPUT_FILE = "output/Vehicle.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)
vehicle_types = load_csv(TYPE_FILE)

headers = [
    "case_rowid",
    "vehicle_number",
    "vehicle_type_rowid",
    "make",
    "model",
    "color",
    "owner_name",
    "chassis_number",
    "engine_number",
    "seized_status"
]

makes = [
    "Maruti Suzuki",
    "Hyundai",
    "Honda",
    "Toyota",
    "Mahindra",
    "Tata",
    "Kia",
    "Ashok Leyland",
    "Bajaj",
    "TVS"
]

models = [
    "Swift",
    "Creta",
    "City",
    "Innova",
    "Scorpio",
    "Nexon",
    "Seltos",
    "Dost",
    "Pulsar",
    "Apache"
]

colors = [
    "White",
    "Black",
    "Silver",
    "Blue",
    "Red",
    "Grey",
    "Brown",
    "Green"
]

rows = []

for case in cases:

    if random.random() < 0.55:

        rows.append([
            case["ROWID"],
            fake.license_plate(),
            random.choice(vehicle_types)["ROWID"],
            random.choice(makes),
            random.choice(models),
            random.choice(colors),
            fake.name(),
            "".join(str(random.randint(0, 9)) for _ in range(17)),
            "".join(str(random.randint(0, 9)) for _ in range(12)),
            random.choice(["true", "false"])
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

print(f"✓ Vehicle.csv created ({len(rows)} records)")