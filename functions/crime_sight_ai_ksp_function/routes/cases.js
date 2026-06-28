async function getCases(app) {

    const datastore = app.datastore();

    const table = datastore.table("CaseMaster");

    const cases = await table.getAllRows();

    return {
        success: true,
        count: cases.length,
        data: cases
    };

}

async function getCaseById(app, rowid) {

    const datastore = app.datastore();

    const table = datastore.table("CaseMaster");

    const rows = await table.getAllRows();

    const crime = rows.find(r => r.ROWID === rowid);

    if (!crime) {
        return {
            success: false,
            message: "Case not found"
        };
    }

    return {
        success: true,
        data: crime
    };

}

module.exports = {
    getCases,
    getCaseById
};