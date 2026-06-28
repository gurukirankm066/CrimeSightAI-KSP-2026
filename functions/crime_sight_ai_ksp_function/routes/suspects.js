'use strict';

async function getSuspects(app) {
  const datastore = app.datastore();
  const suspectRows = await datastore.table('Suspect').getAllRows();

  const suspects = suspectRows.map(s => ({
    id: s.ROWID,
    caseId: s.case_rowid,
    name: s.suspect_name,
    gender: s.gender,
    age: s.age,
    phone: s.phone,
    email: s.email,
    address: s.address,
    occupation: s.occupation,
    arrestStatus: s.arrest_status,
    isRepeatOffender: s.is_repeat_offender === true || s.is_repeat_offender === 'true',
    remarks: s.remarks,
    riskScore: (() => {
      let base = 40;
      if (s.is_repeat_offender === true || s.is_repeat_offender === 'true') base += 25;
      const st = (s.arrest_status || '').toLowerCase();
      if (st === 'absconding') base += 20;
      if (st === 'arrested') base -= 10;
      if (st === 'released on bail') base += 5;
      return Math.min(99, Math.max(10, base));
    })(),
  }));

  return { success: true, count: suspects.length, data: suspects };
}

async function getSuspectsForCase(app, caseRowid) {
  const datastore = app.datastore();
  const rows = await datastore.table('Suspect').getAllRows();
  const suspects = rows
    .filter(s => s.case_rowid === caseRowid)
    .map(s => ({
      id: s.ROWID,
      name: s.suspect_name,
      gender: s.gender,
      age: s.age,
      arrestStatus: s.arrest_status,
      isRepeatOffender: s.is_repeat_offender === true || s.is_repeat_offender === 'true',
      remarks: s.remarks,
    }));
  return { success: true, data: suspects };
}

module.exports = { getSuspects, getSuspectsForCase };
