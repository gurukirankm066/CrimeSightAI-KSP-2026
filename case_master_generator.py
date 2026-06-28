import csv
import os
import random
from datetime import datetime, timedelta
from faker import Faker

fake = Faker("en_IN")

OUTPUT_FILE = "output/CaseMaster.csv"

STATE_FILE = "output/State.csv"
DISTRICT_FILE = "data/Table-District.csv"
UNIT_FILE = "data/Table-Unit.csv"
EMPLOYEE_FILE = "data/Table-Employee.csv"
CRIME_TYPE_FILE = "data/Table-CrimeType.csv"
CRIME_CATEGORY_FILE = "data/Table-CrimeCategory.csv"
ACT_FILE = "data/Table-Act.csv"
SECTION_FILE = "data/Table-Section.csv"

os.makedirs("output", exist_ok=True)


def load_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


states = load_csv(STATE_FILE)
districts = load_csv(DISTRICT_FILE)
units = load_csv(UNIT_FILE)
employees = load_csv(EMPLOYEE_FILE)
crime_types = load_csv(CRIME_TYPE_FILE)
crime_categories = load_csv(CRIME_CATEGORY_FILE)
acts = load_csv(ACT_FILE)
sections = load_csv(SECTION_FILE)

headers = [
    "fir_number",
    "crime_type_rowid",
    "crime_category_rowid",
    "act_rowid",
    "section_rowid",
    "unit_rowid",
    "district_rowid",
    "state_rowid",
    "occurrence_datetime",
    "complaint_datetime",
    "latitude",
    "longitude",
    "place_of_occurrence",
    "complaint_mode",
    "case_priority",
    "case_status",
    "investigation_officer_rowid",
    "created_by_rowid",
    "ai_risk_score",
    "ai_summary",
    "is_sensitive"
]

rows = []
for i in range(500):

    unit = random.choice(units)
    district = random.choice(districts)
    crime_type = random.choice(crime_types)
    crime_category = random.choice(crime_categories)
    act = random.choice(acts)
    section = random.choice(sections)

    officer = random.choice(employees)
    creator = random.choice(employees)

    occurrence = fake.date_time_between(
        start_date="-2y",
        end_date="-1d"
    )

    complaint = occurrence + timedelta(
        minutes=random.randint(15, 720)
    )

    latitude = round(random.uniform(11.5, 18.5), 6)
    longitude = round(random.uniform(74.0, 78.8), 6)

    priority = random.choice([
        "Low",
        "Medium",
        "High",
        "Critical"
    ])

    status = random.choice([
        "Open",
        "Under Investigation",
        "Closed",
        "Charge Sheet Filed"
    ])

    complaint_mode = random.choice([
        "Walk-in",
        "Online",
        "Phone",
        "Emergency 112"
    ])

    risk = round(random.uniform(5, 99), 2)

    rows.append([
        f"FIR-{datetime.now().year}-{i+1:05}",
        crime_type["ROWID"],
        crime_category["ROWID"],
        act["ROWID"],
        section["ROWID"],
        unit["ROWID"],
        district["ROWID"],
        1,
        occurrence.strftime("%Y-%m-%d %H:%M:%S"),
        complaint.strftime("%Y-%m-%d %H:%M:%S"),
        latitude,
        longitude,
        fake.address().replace("\n", ", "),
        complaint_mode,
        priority,
        status,
        officer["ROWID"],
        creator["ROWID"],
        risk,
        fake.sentence(nb_words=12),
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

print(f"✓ CaseMaster.csv created ({len(rows)} records)")