async function dashboard(app) {

    const datastore = app.datastore();

    const caseTable = datastore.table("CaseMaster");
    const officerTable = datastore.table("Employee");

    const cases = await caseTable.getAllRows();
    const officers = await officerTable.getAllRows();

    return {
        success: true,
        totalCases: cases.length,
        openCases: cases.filter(c =>
            (c.case_status || "").toLowerCase() === "open"
        ).length,
        closedCases: cases.filter(c =>
            (c.case_status || "").toLowerCase() === "closed"
        ).length,
        criticalCases: cases.filter(c =>
            (c.case_priority || "").toLowerCase() === "critical"
        ).length,
        totalOfficers: officers.length
    };

}

module.exports = { dashboard };