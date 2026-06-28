'use strict';

const catalyst = require('zcatalyst-sdk-node');
const { dashboard } = require('./routes/dashboard');
const { getCases, getCaseById } = require('./routes/cases');
const { getDistricts } = require('./routes/districts');
const { getOfficers, getOfficerById } = require('./routes/officers');
const { getSuspects, getSuspectsForCase } = require('./routes/suspects');
const { getAnalytics } = require('./routes/analytics');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const app = catalyst.initialize(req);
  res.setHeader('Content-Type', 'application/json');
  const url = req.url || '/';

  try {
    if (url.startsWith('/case/') && url.split('/').length === 3) {
      const rowid = url.split('/')[2];
      return res.end(JSON.stringify(await getCaseById(app, rowid)));
    }
    if (url.startsWith('/officer/') && url.split('/').length === 3) {
      const rowid = url.split('/')[2];
      return res.end(JSON.stringify(await getOfficerById(app, rowid)));
    }
    if (url.startsWith('/suspects/case/') && url.split('/').length === 4) {
      const rowid = url.split('/')[3];
      return res.end(JSON.stringify(await getSuspectsForCase(app, rowid)));
    }

    switch (url) {
      case '/':
        return res.end(JSON.stringify({ success: true, message: 'CrimeSight AI Backend Running' }));
      case '/dashboard':
        return res.end(JSON.stringify(await dashboard(app)));
      case '/cases':
        return res.end(JSON.stringify(await getCases(app)));
      case '/districts':
        return res.end(JSON.stringify(await getDistricts(app)));
      case '/officers':
        return res.end(JSON.stringify(await getOfficers(app)));
      case '/suspects':
        return res.end(JSON.stringify(await getSuspects(app)));
      case '/analytics':
        return res.end(JSON.stringify(await getAnalytics(app)));
      default:
        res.statusCode = 404;
        return res.end(JSON.stringify({ success: false, message: 'API Not Found' }));
    }
  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ success: false, error: err.message }));
  }
};
