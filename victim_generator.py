import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
OUTPUT_FILE = "output/Victim.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)

headers = [
    "case_rowid",
    "victim_name",
    "gender",
    "age",
    "phone",
    "email",
    "aadhaar_number",
    "address",
    "occupation",
    "injury_details",
    "statement",
    "is_primary"
]

rows = []
for case in cases:

    victim_count = random.randint(1, 2)

    for i in range(victim_count):

        gender = random.choice(["Male", "Female"])

        rows.append([
            case["ROWID"],
            fake.name_male() if gender == "Male" else fake.name_female(),
            gender,
            random.randint(18, 75),
            fake.msisdn()[:10],
            fake.email(),
            "".join(str(random.randint(0, 9)) for _ in range(12)),
            fake.address().replace("\n", ", "),
            random.choice([
                "Student",
                "Engineer",
                "Teacher",
                "Business",
                "Farmer",
                "Doctor",
                "Driver",
                "Private Employee",
                "Government Employee",
                "Self Employed"
            ]),
            random.choice([
                "Minor injuries",
                "Serious injuries",
                "No physical injury",
                "Psychological trauma",
                "Hospitalized"
            ]),
            fake.sentence(nb_words=15),
            "true" if i == 0 else "false"
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

print(f"✓ Victim.csv created ({len(rows)} records)")