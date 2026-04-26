/**
 * ═══════════════════════════════════════════════════════
 *  MoneyPaw — Google Apps Script Backend
 *  วางโค้ดนี้ทั้งหมดใน Google Apps Script แล้ว Deploy
 * ═══════════════════════════════════════════════════════
 *
 *  วิธี Deploy:
 *  1. เปิด Google Sheet → Extensions → Apps Script
 *  2. ลบโค้ดเดิมทั้งหมด แล้ว paste โค้ดนี้
 *  3. Deploy → New Deployment
 *     - Type: Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4. Copy "Web app URL" → ใส่ใน .env ของ project
 */

const SHEET_NAME = 'Transactions'
const HEADERS    = ['id', 'date', 'amount', 'category', 'note', 'source', 'createdAt']

// ─── CORS Headers ────────────────────────────────────────────────────────────

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function jsonResponse(data, code) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// ─── Get or Create Sheet ──────────────────────────────────────────────────────

function getSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet()
  let   sheet = ss.getSheetByName(SHEET_NAME)

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground('#1A1A2E')
      .setFontColor('#F9C74F')
      .setFontWeight('bold')
    sheet.setFrozenRows(1)
  }

  return sheet
}

// ─── Actions ──────────────────────────────────────────────────────────────────

function getAllRows() {
  const sheet = getSheet()
  const data  = sheet.getDataRange().getValues()

  if (data.length <= 1) return { rows: [] }

  const headers = data[0]
  const rows    = data.slice(1).map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] })
    return obj
  }).filter(row => row.id && row.id !== '')

  return { rows }
}

function appendRow(rowData) {
  if (!rowData || typeof rowData !== 'object') {
    return { error: 'Invalid row data' }
  }
  const sheet  = getSheet()
  const values = HEADERS.map(h => rowData[h] !== undefined ? rowData[h] : '')
  sheet.appendRow(values)
  return { success: true, id: rowData.id }
}

function appendBatchRows(rowsData) {
  if (!Array.isArray(rowsData) || rowsData.length === 0) {
    return { error: 'Invalid rows data' }
  }
  const sheet    = getSheet()
  const allValues = rowsData.map(row => HEADERS.map(h => row[h] !== undefined ? row[h] : ''))
  const startRow  = sheet.getLastRow() + 1
  sheet.getRange(startRow, 1, allValues.length, HEADERS.length).setValues(allValues)
  return { success: true, count: rowsData.length }
}

function deleteRow(id) {
  if (!id) return { error: 'No id provided' }

  const sheet     = getSheet()
  const data      = sheet.getDataRange().getValues()
  const idColIdx  = HEADERS.indexOf('id')

  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idColIdx]) === String(id)) {
      sheet.deleteRow(i + 1)
      return { success: true }
    }
  }
  return { error: 'Row not found' }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const params = e.parameter || {}
    const action = params.action || ''

    let result

    if (action === 'getAll') {
      result = getAllRows()

    } else if (action === 'append') {
      const row = JSON.parse(params.row || '{}')
      result    = appendRow(row)

    } else if (action === 'appendBatch') {
      const rows = JSON.parse(params.rows || '[]')
      result     = appendBatchRows(rows)

    } else if (action === 'delete') {
      result = deleteRow(params.id)

    } else {
      result = { error: 'Unknown action: ' + action }
    }

    return jsonResponse(result)

  } catch (err) {
    return jsonResponse({ error: err.message || 'Internal error' })
  }
}

// Required for preflight OPTIONS — Google Apps Script handles this automatically
// but we add this for clarity
function doPost(e) {
  return doGet(e)
}
