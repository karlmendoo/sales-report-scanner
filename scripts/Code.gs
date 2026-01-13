/**
 * Google Apps Script - Daily Sales Scanner Web App
 * 
 * This script receives POST requests from the Daily Sales Scanner app
 * and appends rows to the specified Google Spreadsheet.
 * 
 * Setup Instructions:
 * 1. Open your Google Spreadsheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code
 * 4. Click Deploy > New deployment
 * 5. Select type: Web app
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Click Deploy and copy the Web App URL
 * 9. Use this URL in your .env as APPS_SCRIPT_WEBAPP_URL
 */

// Configuration - Update these values
const SHARED_SECRET = 'your_random_secret_token_here'; // Must match SHARED_SECRET_TOKEN in .env
const SPREADSHEET_ID = 'your_spreadsheet_id_here'; // Get from spreadsheet URL

/**
 * Handles POST requests from the Daily Sales Scanner app
 */
function doPost(e) {
  try {
    // Verify authentication token
    const authHeader = e.parameter.authorization || e.postData.headers?.Authorization;
    if (!authHeader || !authHeader.includes(SHARED_SECRET)) {
      return createResponse(401, { ok: false, error: 'Unauthorized' });
    }

    // Parse request body
    const requestData = JSON.parse(e.postData.contents);
    const sheetName = requestData.sheetName || 'DailySales';
    const row = requestData.row;

    if (!row || !Array.isArray(row)) {
      return createResponse(400, { ok: false, error: 'Invalid row data' });
    }

    // Get the spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(sheetName);

    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      
      // Add headers
      const headers = [
        'Date', 'MeterStart', 'MeterEnd', 'CubicConsumption',
        'GallonsQty', '500mlQty', 'WilkinsQty', 'SmallSlimQty',
        'GallonsPrice', '500mlPrice', 'WilkinsPrice', 'SmallSlimPrice',
        'Transportation', 'Labor', 'Supplies', 'UtangPaid', 'OtherExpenses',
        'IsCashAdvanceDay', 'CA_Ryan', 'CA_Rjhay', 'CA_Third',
        'TotalCashAdvance', 'Remarks'
      ];
      sheet.appendRow(headers);
    }

    // Append the row
    sheet.appendRow(row);
    
    // Get the row number that was just appended
    const lastRow = sheet.getLastRow();

    // Log the operation
    Logger.log(`Appended row ${lastRow} to sheet ${sheetName}`);

    return createResponse(200, {
      ok: true,
      appendedRow: lastRow,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return createResponse(500, {
      ok: false,
      error: error.toString()
    });
  }
}

/**
 * Handles GET requests (for testing)
 */
function doGet(e) {
  return createResponse(200, {
    message: 'Daily Sales Scanner Web App is running',
    timestamp: new Date().toISOString()
  });
}

/**
 * Creates a JSON response
 */
function createResponse(status, data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - run this to verify setup
 */
function testAppendRow() {
  const testRow = [
    '2024-01-15', 1234, 1256, 22,
    120, 85, 42, 30,
    25, 15, 20, 10,
    500, 800, 250, 1000, 150,
    true, 2000, 1500, 1000,
    4500, 'Test entry'
  ];

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('DailySales');
  
  if (sheet) {
    sheet.appendRow(testRow);
    Logger.log('Test row appended successfully');
  } else {
    Logger.log('Sheet not found');
  }
}
