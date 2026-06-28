import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

UNIT_FILE = "data/Table-Unit.csv"
RANK_FILE = "data/Table-Rank.csv"
DESIGNATION_FILE = "data/Table-Designation.csv"
ROLE_FILE = "data/Table-UserRole.csv"

OUTPUT_FILE = "output/Employee.csv"

os.makedirs("output", exist_ok=True)


def read_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


units = read_csv(UNIT_FILE)
ranks = read_csv(RANK_FILE)
designations = read_csv(DESIGNATION_FILE)
roles = read_csv(ROLE_FILE)


rank_map = {r["rank_name"]: r["ROWID"] for r in ranks}
designation_map = {d["designation_name"]: d["ROWID"] for d in designations}
role_map = {r["role_name"]: r["ROWID"] for r in roles}


headers = [
    "employee_id",
    "full_name",
    "badge_number",
    "email",
    "phone",
    "rank_rowid",
    "designation_rowid",
    "unit_rowid",
    "role_rowid",
]

rows = []

employee_no = 1
employee_templates = [
    ("Police Inspector", "Police Inspector", "Police Inspector"),
    ("Sub Inspector", "Sub Inspector", "Sub Inspector"),
    ("Police Constable", "Police Constable", "Constable"),
]

for unit in units:

    unit_rowid = unit["ROWID"]

    for rank_name, designation_name, role_name in employee_templates:

        full_name = fake.name()

        employee_id = f"EMP{employee_no:05}"

        badge_number = f"KSP{100000 + employee_no}"

        email = (
            full_name.lower()
            .replace(" ", ".")
            .replace("'", "")
            + "@ksp.gov.in"
        )

        phone = "9" + "".join(
            str(random.randint(0, 9))
            for _ in range(9)
        )

        rows.append([
            employee_id,
            full_name,
            badge_number,
            email,
            phone,
            rank_map[rank_name],
            designation_map[designation_name],
            unit_rowid,
            role_map[role_name]
        ])

        employee_no += 1
with open(
    OUTPUT_FILE,
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.writer(file)
    writer.writerow(headers)
    writer.writerows(rows)

print(f"✓ Employee.csv created ({len(rows)} employees)")