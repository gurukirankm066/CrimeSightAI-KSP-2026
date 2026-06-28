'use strict';

const DISTRICT_COORDS = {
  Bagalkote: [16.18, 75.69], Ballari: [15.14, 76.92], Belagavi: [15.85, 74.50],
  Bengaluru: [12.97, 77.59], 'Bengaluru Rural': [13.22, 77.50], Bidar: [17.91, 77.52],
  Chamarajanagar: [11.92, 76.94], Chikkaballapur: [13.43, 77.73], Chikkamagaluru: [13.32, 75.77],
  Chitradurga: [14.23, 76.40], 'Dakshina Kannada': [12.86, 75.74], Davanagere: [14.46, 75.92],
  Dharwad: [15.45, 75.01], Gadag: [15.42, 75.62], Hassan: [13.00, 76.10],
  Haveri: [14.79, 75.40], Kalaburagi: [17.33, 76.83], Kodagu: [12.42, 75.74],
  Kolar: [13.14, 78.13], Koppal: [15.35, 76.15], Mandya: [12.52, 76.90],
  Mysuru: [12.30, 76.64], Raichur: [16.21, 77.36], Ramanagara: [12.72, 77.28],
  Shivamogga: [13.93, 75.57], Tumakuru: [13.34, 77.10], Udupi: [13.33, 74.75],
  'Uttara Kannada': [14.79, 74.68], Vijayapura: [16.83, 75.72], Yadgir: [16.77, 77.14],
  Hubballi: [15.36, 75.12],
};

async function getDistricts(app) {
  const datastore = app.datastore();
  const [districtRows, caseRows] = await Promise.all([
    datastore.table('District').getAllRows(),
    datastore.table('CaseMaster').getAllRows(),
  ]);

  const countByDistrict = {};
  const criticalByDistrict = {};
  const openByDistrict = {};
  for (const c of caseRows) {
    const did = c.district_rowid;
    countByDistrict[did] = (countByDistrict[did] || 0) + 1;
    if ((c.case_priority || '').toLowerCase() === 'critical')
      criticalByDistrict[did] = (criticalByDistrict[did] || 0) + 1;
    const st = (c.case_status || '').toLowerCase();
    if (st === 'open' || st === 'under investigation')
      openByDistrict[did] = (openByDistrict[did] || 0) + 1;
  }

  const districts = districtRows.map(d => {
    const total = countByDistrict[d.ROWID] || 0;
    const open = openByDistrict[d.ROWID] || 0;
    const critical = criticalByDistrict[d.ROWID] || 0;
    const coords = DISTRICT_COORDS[d.district_name] || [15.0, 75.5];
    const crimeIndex = Math.min(100, Math.round((total / 25) * 100));
    return {
      id: d.ROWID,
      name: d.district_name,
      code: d.district_code,
      lat: coords[0],
      lng: coords[1],
      population: 0,
      crimeIndex,
      activeCases: open,
      totalCases: total,
      criticalCases: critical,
      trend: 0,
    };
  });

  return { success: true, count: districts.length, data: districts };
}

module.exports = { getDistricts };
