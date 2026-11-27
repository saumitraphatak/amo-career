/**
 * AMO Toolkit — Optional Live Telemetry & Email Notification Receiver
 * -------------------------------------------------------------------
 * Deploy as a Google Apps Script Web App (https://script.google.com):
 *   1. Create a new Google Sheet with a tab named "Events" (header row:
 *      Timestamp | Event | Page | Detail | Referrer).
 *   2. Extensions → Apps Script → paste this file → set NOTIFY_EMAIL below.
 *   3. Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 *   4. Copy the Web App URL into `AMO_TELEMETRY_URL` in js/main.js. (The online book, book/_build/reader.js,
 *      records the same events in GA4 and in the browser's own log, but sends nothing to this endpoint.)
 *
 * No personal data (PII) is stored — only aggregate event name, page path, and asset label.
 */

const SHEET_NAME = 'Events';
const NOTIFY_EMAIL = ''; // e.g. 'you@example.com' — leave empty to disable email alerts
const NOTIFY_EVENTS = { book_pdf_download: true }; // add figure_export / notebook_download if desired

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['Timestamp', 'Event', 'Page', 'Detail', 'Referrer']);
  }
  return sh;
}

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    const data = JSON.parse(raw);
    const ev = String(data.event || 'unknown').slice(0, 64);
    const page = String(data.page || '').slice(0, 180);
    const detail = String(data.detail || '').slice(0, 220);
    const ref = String(data.referrer || '').slice(0, 180);
    const ts = new Date().toISOString();

    getSheet_().appendRow([ts, ev, page, detail, ref]);

    if (NOTIFY_EMAIL && NOTIFY_EVENTS[ev]) {
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        subject: '[AMO Toolkit] ' + ev + ': ' + (detail || page),
        body: 'Event: ' + ev + '\nPage: ' + page + '\nDetail: ' + detail + '\nTime: ' + ts + '\nReferrer: ' + ref,
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  const sh = getSheet_();
  const rows = sh.getDataRange().getValues();
  const counts = {
    book_pdf_download: 0,
    figure_export: 0,
    notebook_download: 0,
    page_print: 0,
    citation_copy: 0,
  };
  for (let i = 1; i < rows.length; i++) {
    const ev = String(rows[i][1] || '');
    if (Object.prototype.hasOwnProperty.call(counts, ev)) counts[ev]++;
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, counts }))
    .setMimeType(ContentService.MimeType.JSON);
}
