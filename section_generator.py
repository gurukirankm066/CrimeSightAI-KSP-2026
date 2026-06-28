import csv
import os

ACT_FILE = "data/Table-Act.csv"
OUTPUT_FILE = "output/Section.csv"

os.makedirs("output", exist_ok=True)


def load_acts():
    acts = []
    with open(ACT_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            acts.append(row)
    return acts


acts = load_acts()

headers = [
    "section_code",
    "section_title",
    "act_rowid",
    "description",
    "is_active"
]

rows = []

sections = [
    ("302", "Murder"),
    ("379", "Theft"),
    ("392", "Robbery"),
    ("354", "Assault on Woman"),
    ("420", "Cheating"),
    ("406", "Criminal Breach of Trust"),
    ("376", "Rape"),
    ("457", "House Breaking"),
    ("120B", "Criminal Conspiracy"),
    ("34", "Common Intention")
]

for i, section in enumerate(sections):

    act = acts[i % len(acts)]

    rows.append([
        section[0],
        section[1],
        act["ROWID"],
        section[1],
        "true"
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

print("✓ Section.csv created")