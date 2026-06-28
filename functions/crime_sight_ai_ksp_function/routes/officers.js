'use strict';

async function getOfficers(app) {
  const datastore = app.datastore();
  const [empRows, rankRows, unitRows, caseRows] = await Promise.all([
    datastore.table('Employee').getAllRows(),
    datastore.table('Rank').getAllRows(),
    datastore.table('Unit').getAllRows(),
    datastore.table('CaseMaster').getAllRows(),
  ]);

  const rankById = Object.fromEntries(rankRows.map(r => [r.ROWID, r]));
  const unitById = Object.fromEntries(unitRows.map(u => [u.ROWID, u]));

  const caseloadById = {};
  for (const c of caseRows) {
    const oid = c.investigation_officer_rowid;
    caseloadById[oid] = (caseloadById[oid] || 0) + 1;
  }

  const officers = empRows.map(e => {
    const rank = rankById[e.rank_rowid] || {};
    const unit = unitById[e.unit_rowid] || {};
    return {
      id: e.ROWID,
      employeeId: e.employee_id,
      name: e.full_name,
      badge: e.badge_number,
      email: e.email,
      phone: e.phone,
      rank: rank.rank_name || 'Unknown',
      rankCode: rank.rank_code || '',
      rankHierarchy: rank.hierarchy || 99,
      unit: unit.unit_name || 'Unknown',
      unitCode: unit.unit_code || '',
      caseload: caseloadById[e.ROWID] || 0,
    };
  });

  return { success: true, count: officers.length, data: officers };
}

async function getOfficerById(app, rowid) {
  const result = await getOfficers(app);
  const officer = result.data.find(o => o.id === rowid);
  if (!officer) return { success: false, message: 'Officer not found' };
  return { success: true, data: officer };
}

module.exports = { getOfficers, getOfficerById };
