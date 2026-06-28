from generators.master_generator import (
    generate_state,
    generate_district,
    generate_rank,
    generate_designation,
)

from generators.unit_generator import generate_units


generate_state()
generate_district()
generate_rank()
generate_designation()
generate_units()

print("\nAll master datasets generated successfully.")