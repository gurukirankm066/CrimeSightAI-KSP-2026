import csv
import os

os.makedirs("output", exist_ok=True)

headers = [
    "act_name",
    "act_code",
    "description",
    "is_active"
]

rows = [
    ["Bharatiya Nyaya Sanhita, 2023", "BNS", "Primary criminal law", "true"],
    ["Bharatiya Nagarik Suraksha Sanhita, 2023", "BNSS", "Criminal procedure", "true"],
    ["Bharatiya Sakshya Adhiniyam, 2023", "BSA", "Law of evidence", "true"],
    ["Information Technology Act, 2000", "IT", "Cyber offences", "true"],
    ["NDPS Act, 1985", "NDPS", "Narcotics offences", "true"],
    ["Motor Vehicles Act, 1988", "MVA", "Traffic offences", "true"],
    ["POCSO Act, 2012", "POCSO", "Child protection", "true"],
    ["Arms Act, 1959", "ARMS", "Weapons offences", "true"],
    ["Dowry Prohibition Act, 1961", "DPA", "Dowry offences", "true"],
    ["Prevention of Corruption Act, 1988", "PCA", "Corruption offences", "true"]
]

with open(
    "output/Act.csv",
    "w",
    newline="",
    encoding="utf-8"
) as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)

print("✓ Act.csv created")