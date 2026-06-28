import csv
import os

os.makedirs("output", exist_ok=True)

headers = [
    "crime_category_name",
    "crime_category_code",
    "description",
    "is_active"
]

rows = [
    ["Violent Crime", "CC001", "Crimes against persons", "true"],
    ["Property Crime", "CC002", "Property related crimes", "true"],
    ["Cyber Crime", "CC003", "Cyber offences", "true"],
    ["Economic Offence", "CC004", "Financial crimes", "true"],
    ["Women & Child Crime", "CC005", "Women and child offences", "true"],
    ["Narcotics", "CC006", "Drug offences", "true"],
    ["Traffic", "CC007", "Traffic violations", "true"],
    ["Public Order", "CC008", "Public peace offences", "true"],
    ["Missing Person", "CC009", "Missing person complaints", "true"],
    ["Others", "CC010", "Miscellaneous offences", "true"]
]

with open(
    "output/CrimeCategory.csv",
    "w",
    newline="",
    encoding="utf-8"
) as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)

print("✓ CrimeCategory.csv created")