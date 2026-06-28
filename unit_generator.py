import csv
import os

INPUT_FILE = "data/Table-District.csv"
OUTPUT_FILE = "output/Unit.csv"

os.makedirs("output", exist_ok=True)


def load_districts():
    districts = []

    with open(INPUT_FILE, "r", newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for row in reader:
            districts.append({
                "rowid": row["ROWID"],
                "name": row["district_name"]
            })

    return districts


def save(rows):

    headers = [
        "unit_name",
        "unit_code",
        "district_rowid",
        "unit_type",
        "address",
        "latitude",
        "longitude",
        "contact_number",
        "email",
        "is_active"
    ]

    with open(
        OUTPUT_FILE,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow(headers)
        writer.writerows(rows)

    print("✓ Unit.csv created")


def generate_units():

    districts = load_districts()

    rows = []

    counter = 1

    for district in districts:

        district_name = district["name"]
        district_rowid = district["rowid"]

        # District Police Office
        rows.append([
            f"{district_name} District Police Office",
            f"U{counter:03}",
            district_rowid,
            "District Police Office",
            f"Police Headquarters, {district_name}, Karnataka",
            round(12.900 + counter * 0.05, 6),
            round(76.100 + counter * 0.05, 6),
            f"080{counter:07}",
            f"dpo.{district_name.lower().replace(' ', '').replace('-', '')}@ksp.gov.in",
            "true"
        ])

        counter += 1

        # Town Police Station
        rows.append([
            f"{district_name} Town Police Station",
            f"U{counter:03}",
            district_rowid,
            "Police Station",
            f"Town Police Station, {district_name}, Karnataka",
            round(12.905 + counter * 0.05, 6),
            round(76.105 + counter * 0.05, 6),
            f"080{counter:07}",
            f"ps.{district_name.lower().replace(' ', '').replace('-', '')}@ksp.gov.in",
            "true"
        ])

        counter += 1

    save(rows)


if __name__ == "__main__":
    generate_units()