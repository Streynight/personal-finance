/**
 * Personal Finance — Google Apps Script Backend
 * วางโค้ดนี้ใน Google Apps Script แล้ว Deploy เป็น Web App
 *
 * Deploy settings:
 *   Execute as: Me
 *   Who has access: Anyone
 */

const SHEET_NAME = 'Transactions'
const HEADERS    = ['id','date','amount','category','note','source','createdAt']

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sh   = ss.getSheetByName(SHEET_NAME)
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME)
    sh.getRange(1,1,1,HEADERS.length).setValues([HEADERS])
    sh.getRange(1,1,1,HEADERS.length).setBackground('#2563EB').setFontColor('#fff').setFontWeight('bold')
    sh.setFrozenRows(1)
  }
  return sh
}

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)
}

function doGet(e) {
  try {
    const p  = e.parameter || {}
    const sh = getSheet()

    if (p.action === 'getAll') {
      const vals = sh.getDataRange().getValues()
      if (vals.length <= 1) return jsonOut({ rows: [] })
      const hdrs = vals[0]
      const rows = vals.slice(1)
        .map(r => { const o={}; hdrs.forEach((h,i)=>{ o[h]=r[i] }); return o })
        .filter(r => r.id && r.id !== '')
      return jsonOut({ rows })
    }

    if (p.action === 'append') {
      const row = JSON.parse(p.row || '{}')
      sh.appendRow(HEADERS.map(h => row[h] !== undefined ? row[h] : ''))
      return jsonOut({ success: true })
    }

    if (p.action === 'delete') {
      const vals   = sh.getDataRange().getValues()
      const idCol  = HEADERS.indexOf('id')
      for (let i = vals.length - 1; i >= 1; i--) {
        if (String(vals[i][idCol]) === String(p.id)) { sh.deleteRow(i+1); return jsonOut({ success: true }) }
      }
      return jsonOut({ error: 'not found' })
    }

    return jsonOut({ error: 'unknown action' })
  } catch(err) {
    return jsonOut({ error: err.message })
  }
}

function doPost(e) { return doGet(e) }
