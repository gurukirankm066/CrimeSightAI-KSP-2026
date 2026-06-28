const catalyst = require("zcatalyst-sdk-node");

module.exports = async (req, res) => {
    const app = catalyst.initialize(req);
    const datastore = app.datastore();
    const table = datastore.table("District");

    const rows = await table.getAllRows();

    res.end(JSON.stringify(rows[0], null, 2));
};
