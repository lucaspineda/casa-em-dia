import { google } from "googleapis";

type LeadRowInput = {
  email: string;
  phone: string;
  address: string;
  consent: boolean;
};

type GoogleSheetsConfig = {
  spreadsheetId: string;
  sheetName: string;
  clientEmail: string;
  privateKey: string;
};

const GOOGLE_SHEETS_SCOPE = [
  "https://www.googleapis.com/auth/spreadsheets",
];

function readConfig(): GoogleSheetsConfig {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME?.trim() || "Leads";
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error(
      "Google Sheets integration is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL, and GOOGLE_SHEETS_PRIVATE_KEY.",
    );
  }

  return {
    spreadsheetId,
    sheetName,
    clientEmail,
    privateKey,
  };
}

export async function appendLeadToSheet(input: LeadRowInput): Promise<void> {
  const config = readConfig();
  const auth = new google.auth.JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: GOOGLE_SHEETS_SCOPE,
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.spreadsheetId,
    range: `${config.sheetName}!A:E`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          input.email,
          input.phone,
          input.address,
          input.consent ? "yes" : "no",
        ],
      ],
    },
  });
}