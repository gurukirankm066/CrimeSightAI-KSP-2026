import csv
import os

OUTPUT_FILE = "output/UserRole.csv"

os.makedirs("output", exist_ok=True)


def generate_roles():

    headers = [
        "role_name",
        "role_code",
        "description",
        "is_active"
    ]

    rows = [
        ["Administrator", "ADMIN", "System Administrator", "true"],
        ["SCRB Analyst", "SCRB", "Crime Analytics Team", "true"],
        ["Superintendent", "SP", "District Superintendent", "true"],
        ["Investigating Officer", "IO", "Case Investigation", "true"],
        ["Station House Officer", "SHO", "Police Station Head", "true"],
        ["Police Inspector", "PI", "Police Inspector", "true"],
        ["Sub Inspector", "SI", "Sub Inspector", "true"],
        ["Constable", "PC", "Police Constable", "true"],
        ["Data Entry Operator", "DEO", "Data Entry", "true"],
        ["Read Only User", "READONLY", "Read Only Access", "true"]
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

    print("✓ UserRole.csv created")


if __name__ == "__main__":
    generate_roles()