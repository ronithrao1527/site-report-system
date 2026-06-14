const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { google } = require("googleapis");
const path = require("path");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
}));
app.options("*", cors());
app.use(express.json());


// =========================
// Static Uploads Folder
// =========================

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);


// =========================
// Multer Configuration
// =========================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {
        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage
});


// =========================
// Google Sheets Config
// =========================

const SHEET_ID =
    "1JrQ0Lm7NkP7pH7msE4uzeUyiy0StCCcrymxugf3Axuc";

async function getSheetsService() {

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
        },
        scopes: [
            "https://www.googleapis.com/auth/spreadsheets"
        ]
    });

    const client = await auth.getClient();

    return google.sheets({
        version: "v4",
        auth: client
    });
}


// =========================
// Health Check
// =========================

app.get("/", (req, res) => {
    res.send("Site Report API Running");
});


// =========================
// Submit Report API
// =========================

app.post(
    "/submit-report",
    upload.single("photo"),
    async (req, res) => {

        try {

            const {
                siteName,
                engineerName,
                expenses,
                completion,
                remarks,
                requiredMaterial
            } = req.body;

            const sheets = await getSheetsService();

            const dateTime =
                new Date().toLocaleString("en-IN");

            let photoUrl = "";

            if (req.file) {
                photoUrl =
                    `http://localhost:3000/uploads/${req.file.filename}`;
            }

            await sheets.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: "Sheet1!A:H",
                valueInputOption: "USER_ENTERED",

                requestBody: {
                    values: [[
                        dateTime,
                        siteName,
                        engineerName,
                        expenses,
                        completion,
                        remarks,
                        requiredMaterial,
                        photoUrl
                    ]]
                }
            });

            res.status(200).json({
                success: true,
                message: "Report Saved Successfully"
            });

        } catch (error) {
            console.error("FULL ERROR:");
            console.error(error);

            if (error.response) {
                console.error(error.response.data);
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);


// =========================
// Start Server
// =========================

app.listen(3000, () => {
    console.log(
        "Server running on http://localhost:3000"
    );
});