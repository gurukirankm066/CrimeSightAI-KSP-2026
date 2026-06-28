import csv
import os

OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def save_csv(filename, headers, rows):
    path = os.path.join(OUTPUT_DIR, filename)

    with open(path, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"✓ {filename} created")


def generate_state():
    save_csv(
        "State.csv",
        ["state_name", "state_code", "is_active"],
        [["Karnataka", "KA", "true"]]
    )


def generate_district():
    districts = [
        "Bagalkote","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban",
        "Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru",
        "Chitradurga","Dakshina Kannada","Davanagere","Dharwad","Gadag",
        "Hassan","Haveri","Kalaburagi","Kodagu","Kolar","Koppal",
        "Mandya","Mysuru","Raichur","Ramanagara","Shivamogga",
        "Tumakuru","Udupi","Uttara Kannada","Vijayapura","Yadgir",
        "Vijayanagara"
    ]

    rows = []

    for i, district in enumerate(districts, start=1):
        rows.append([
            district,
            f"D{i:02}",
            1,
            "true"
        ])

    save_csv(
        "District.csv",
        ["district_name","district_code","state_rowid","is_active"],
        rows
    )


def generate_rank():

    rows = [
        ["Director General of Police","DGP",1,"true"],
        ["Additional Director General","ADGP",2,"true"],
        ["Inspector General","IGP",3,"true"],
        ["Deputy Inspector General","DIG",4,"true"],
        ["Superintendent of Police","SP",5,"true"],
        ["Additional SP","ASP",6,"true"],
        ["Deputy SP","DySP",7,"true"],
        ["Police Inspector","PI",8,"true"],
        ["Sub Inspector","SI",9,"true"],
        ["Assistant Sub Inspector","ASI",10,"true"],
        ["Head Constable","HC",11,"true"],
        ["Police Constable","PC",12,"true"]
    ]

    save_csv(
        "Rank.csv",
        ["rank_name","rank_code","hierarchy","is_active"],
        rows
    )


def generate_designation():

    rows = [
        ["Director General of Police","DGP",1,"true"],
        ["Additional Director General","ADGP",2,"true"],
        ["Inspector General","IGP",3,"true"],
        ["Deputy Inspector General","DIG",4,"true"],
        ["Superintendent of Police","SP",5,"true"],
        ["Additional SP","ASP",6,"true"],
        ["Deputy SP","DySP",7,"true"],
        ["Police Inspector","PI",8,"true"],
        ["Sub Inspector","SI",9,"true"],
        ["Assistant Sub Inspector","ASI",10,"true"],
        ["Head Constable","HC",11,"true"],
        ["Police Constable","PC",12,"true"]
    ]

    save_csv(
        "Designation.csv",
        ["designation_name","designation_code","sort_order","is_active"],
        rows
    )


if __name__ == "__main__":
    generate_state()
    generate_district()
    generate_rank()
    generate_designation()