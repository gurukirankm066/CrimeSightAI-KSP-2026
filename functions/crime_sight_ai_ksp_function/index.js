'use strict';

const catalyst = require("zcatalyst-sdk-node");
const { dashboard } = require("./routes/dashboard");
const { getCases, getCaseById } = require("./routes/cases");

module.exports = async (req, res) => {

    // 👇 ADD THESE LINES
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.statusCode = 200;
        return res.end();
    }
    // 👆 END

    const app = catalyst.initialize(req);

    res.setHeader("Content-Type", "application/json");

    try {
        if (req.url.startsWith("/case/")) {

            const rowid = req.url.split("/")[2];

            const data = await getCaseById(app, rowid);

            return res.end(JSON.stringify(data));

        }

        switch (req.url) {

            case "/":
                return res.end(JSON.stringify({
                    success: true,
                    message: "CrimeSight AI Backend Running"
                }));

            case "/dashboard": {

                const data = await dashboard(app);

                return res.end(JSON.stringify(data));

            }

            case "/cases": {

                const data = await getCases(app);

                return res.end(JSON.stringify(data));




            }

            default:
                return res.end(JSON.stringify({
                    success: false,
                    message: "API Not Found"
                }));

        }

    } catch (err) {

        res.statusCode = 500;

        return res.end(JSON.stringify({
            success: false,
            error: err.message
        }));

    }

};