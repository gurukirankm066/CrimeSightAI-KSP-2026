import csv
import os
import random
from faker import Faker

fake = Faker("en_IN")

CASE_FILE = "data/Table-CaseMaster.csv"
OUTPUT_FILE = "output/Suspect.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


cases = load_csv(CASE_FILE)

headers = [
    "case_rowid",
    "suspect_name",
    "gender",
    "age",
    "phone",
    "email",
    "aadhaar_number",
    "address",
    "occupation",
    "arrest_status",
    "is_repeat_offender",
    "remarks"
]

rows = []
for case in cases:

    suspect_count = random.randint(0, 2)

    for _ in range(suspect_count):

        gender = random.choice(["Male", "Female"])

        rows.append([
            case["ROWID"],
            fake.name_male() if gender == "Male" else fake.name_female(),
            gender,
            random.randint(18, 70),
            fake.msisdn()[:10],
            fake.email(),
            "".join(str(random.randint(0, 9)) for _ in range(12)),
            fake.address().replace("\n", ", "),
            random.choice([
                "Student",
                "Driver",
                "Business",
                "Farmer",
                "Labourer",
                "Engineer",
                "Teacher",
                "Private Employee",
                "Self Employed",
                "Unemployed"
            ]),
            random.choice([
                "Arrested",
                "Absconding",
                "Under Investigation",
                "Released on Bail",
                "Unknown"
            ]),
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

print(f"✓ Suspect.csv created ({len(rows)} records)")