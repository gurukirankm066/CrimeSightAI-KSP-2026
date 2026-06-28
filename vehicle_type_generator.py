import csv
import os

os.makedirs("output", exist_ok=True)

headers = [
    "vehicle_type_name",
    "vehicle_type_code",
    "description",
    "is_active"
]

rows = [
    ["Car","VT001","Cars","true"],
    ["Motorcycle","VT002","Motorcycles","true"],
    ["Bus","VT003","Buses","true"],
    ["Truck","VT004","Trucks","true"],
    ["Auto Rickshaw","VT005","Auto Rickshaws","true"],
    ["Bicycle","VT006","Bicycles","true"],
    ["Van","VT007","Vans","true"],
    ["Tractor","VT008","Tractors","true"],
    ["SUV","VT009","Sports Utility Vehicles","true"],
    ["Other","VT010","Other Vehicles","true"]
]

with open(
    "output/VehicleType.csv",
    "w",
    newline="",
    encoding="utf-8"
) as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(rows)

print("✓ VehicleType.csv created")