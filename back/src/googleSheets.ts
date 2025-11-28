import { google } from "googleapis";

export type GoogleCredentials = {
  client_email: string;
  private_key: string;
};

export async function appendToSheet(
  spreadsheetId: string,
  credentials: GoogleCredentials,
  data: any[]
) {
  try {
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [data],
      },
    });

    console.log("Append to Google Sheets → OK");
  } catch (error) {
    console.error("Error appending to sheet:", error);
    throw error;
  }
}
