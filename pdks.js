// pdks-script-version: 1
//
// The version above is what lets the app accept a newer copy of this file than the one it
// ships with. It is inside the signed bytes on purpose: a published script is only used when
// its version is HIGHER than the one in use, so a valid signature over an older script cannot
// be replayed to roll the automation back. Raise it by one in every change that is published
// to mucahitpuren/trt-atlas, and never lower it.
//
// pdks.js — page automation for TRT PDKS (ASP.NET WebForms + DevExpress).
// Injected into a hidden WKWebView (and by tools/cdp-eval.mjs for live checks).
// Exposes window.trtMesai; every function is synchronous and returns JSON-serializable values.
// Safe to inject more than once (re-injection just replaces window.trtMesai) and never throws
// on pages where the expected controls are missing.
//
// Verified live 2026-10-18 (see .superpowers/sdd/.../task-6-report.md):
//   * "Geçişleri Listele" (DevExpress button ..._FLFiltreler_btnGoruntule, caption on the page is
//     "Geçisleri Listele") does a FULL-PAGE POSTBACK, not a grid callback: the document is replaced.
//     After listButtonClick() wait for the next navigation to finish, re-inject this script, then
//     extractRows(). isGridBusy() returns true on the old document until it is replaced, and on the
//     new one while it is loading or the grid is in a callback.
//   * A date range returns ONE ROW PER CALENDAR DAY, in date order, weekends included
//     (tarih "YYYY-MM-DD(Hafta Sonu)"). 12.10–16.10.2026 -> 5 rows (12..16), 01.09–18.10.2026 (48 days) -> 20 rows on page 1 of 3.
//   * The grid PAGES AT 20 ROWS (01.09–18.10 showed 20 rows, page count 3); extractRows() reads
//     only the visible page. A Monday–Sunday week (<= 7 rows) always fits on one page, so
//     Task 7's fetchRange can use one query per week.
//   * The default report (no postback) lists only today.
//
// Privacy: extractRows() reads only the 8 columns below. The PERSONEL, SİCİL NO and
// T.C. KİMLİK NO columns are never read.
//
// "Kişi Tüm Geçişler Raporu" (KurumIdare/Raporlar/GecisRaporlari/GenelRaporlar/
// TarihKisiBazliTumGecisler.aspx), mapped with REA on 2026-10-21:
//   * Lists every turnstile/door pass of the signed-in person: columns "#", "TARIH"
//     ("dd.MM.yyyy HH:mm:ss"), "ISLEM NOKTASI" (gate name) and "ISLEM TÜRÜ" ("Giris" / "Çikis"),
//     oldest first. extractPasses() reads only TARIH and ISLEM TÜRÜ.
//   * "Listele" (..._btnGoruntule) runs CBPItems.PerformCallback('List'): a callback that
//     replaces the callback panel, NOT a page load. listPasses() marks the grid so
//     passesSettled() can tell when the new content is in.
//   * The grid pages at 30 rows (GotoPage is a grid callback).
//   * Defaults: today..today, time fields 00:00:56..23:59:56 (the whole day), all gates. Setting
//     the time fields from script made the server drop today's passes, so they are left alone.
//   * The "İlk Giriş Son Çıkış" report can show a re-entry after a break as the first entry;
//     the app takes the first "Giris" and the last "Çikis" of each day from this report.
(function () {
  'use strict';

  var PREFIX = 'ctl00_ContentPlaceHolder1_RpListe_';
  var GRID_ID = PREFIX + 'gridListe';
  var DATE_FROM = PREFIX + 'FLFiltreler_deTarihBaslangic';
  var DATE_TO = PREFIX + 'FLFiltreler_deTarihBitis';
  var LIST_BUTTON = PREFIX + 'FLFiltreler_btnGoruntule';

  // Normalized header text -> row key. Only these columns are ever read.
  var COLUMNS = {
    'TARIH': 'tarih',
    'ATANMIS VARDIYA': 'vardiya',
    'GIRIS': 'giris',
    'GIRIS DURUM': 'girisDurum',
    'CIKIS': 'cikis',
    'CIKIS DURUM': 'cikisDurum',
    'IZIN BILGILERI': 'izin',
    'ACIKLAMA': 'aciklama'
  };
  var KEYS = ['tarih', 'vardiya', 'giris', 'girisDurum', 'cikis', 'cikisDurum', 'izin', 'aciklama'];

  // "Kişi Tüm Geçişler Raporu"
  var PASS_FILTER = 'ctl00_ContentPlaceHolder1_RpFiltrelemeKurallari_FLSonGecisler_';
  var PASS_PANEL = 'ctl00_ContentPlaceHolder1_ASPxRoundPanel1_CBPItems';
  var PASS_GRID = PASS_PANEL + '_gridListe';
  var PASS_COLUMNS = { 'TARIH': 'tarih', 'ISLEM TURU': 'tur' };

  function normalize(text) {
    var folds = { 'İ': 'I', 'Ş': 'S', 'Ç': 'C', 'Ğ': 'G', 'Ü': 'U', 'Ö': 'O' };
    return String(text || '')
      .replace(/\u00A0/g, ' ')
      .toUpperCase()
      .replace(/[İŞÇĞÜÖ]/g, function (c) { return folds[c]; })
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cellText(el) {
    return String(el.textContent || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function byId(id) { return document.getElementById(id); }

  function client(name) {
    try {
      var c = window[name];
      return c && typeof c === 'object' ? c : null;
    } catch (e) { return null; }
  }

  // Giris.aspx: "lblLoginResult" is the DevExpress label's client instance name; its element id
  // is "cbpYeniSifre_PCLogin_LblLoginResult". LoginCallback fills it via SetText (no reload).
  function loginResultText() {
    var label = client('lblLoginResult');
    if (label && typeof label.GetText === 'function') {
      try { return String(label.GetText() || '').trim(); } catch (e) { /* fall through */ }
    }
    var el = document.querySelector('[id$="LblLoginResult"], [id$="lblLoginResult"]');
    return el ? cellText(el) : '';
  }

  function pageState() {
    try {
      if (byId('tbUserName')) {
        var msg = loginResultText();
        if (!msg) return 'login';
        if (msg.toLocaleLowerCase('tr').indexOf('süresi dolmuş') >= 0) return 'passwordExpired:' + msg;
        return 'loginError:' + msg;
      }
      if (byId(GRID_ID)) return 'report';
      if (byId(PASS_PANEL)) return 'passes';
      if (reportURL() || /\/index\.html$/i.test(location.pathname) || document.querySelector('frameset')) return 'home';
      return 'unknown';
    } catch (e) { return 'unknown'; }
  }

  function login(user, pass) {
    var u = byId('tbUserName'), p = byId('tbPassword'), b = byId('btnLogin');
    if (!u || !p || !b) return false;
    u.value = user;
    p.value = pass;
    var btn = client('btnLogin'); // DevExpress client instance; runs cbpLogin.PerformCallback('login')
    if (btn && typeof btn.DoClick === 'function') btn.DoClick(); else b.click();
    return true;
  }

  // Link to "Kişi Tüm Geçişler Raporu" in the PizzyLeft.aspx menu.
  function passesURL() {
    var links = document.querySelectorAll('a[href*="TumGecisler"]');
    return links.length ? links[0].href : null;
  }

  function reportURL() {
    var links = document.querySelectorAll('a[href*="PersonelGirisCikis.aspx"]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].href.indexOf('KisiID=') >= 0) return links[i].href;
    }
    return null;
  }

  // Returns the rows of the visible grid page, or null when the grid or one of the 8 expected
  // column headers is missing (the page layout changed).
  function extractRows() {
    try {
      var grid = byId(GRID_ID);
      if (!grid) return null;
      // Header cells carry ids "<grid>_col<N>"; data cells appear in the same order. Other nodes
      // whose ids merely start with that prefix are skipped and do not count as columns.
      var headers = grid.querySelectorAll('[id^="' + GRID_ID + '_col"]');
      var positions = {};
      var column = 0;
      for (var h = 0; h < headers.length; h++) {
        if (!/_col\d+$/.test(headers[h].id)) continue;
        var key = COLUMNS[normalize(cellText(headers[h]))];
        if (key) positions[key] = column;
        column++;
      }
      if (Object.keys(positions).length !== KEYS.length) return null;
      var rows = grid.querySelectorAll('tr[id^="' + GRID_ID + '_DXDataRow"]');
      var out = [];
      for (var r = 0; r < rows.length; r++) {
        var cells = rows[r].querySelectorAll(':scope > td.dxgv');
        var row = {};
        for (var k = 0; k < KEYS.length; k++) {
          var cell = cells[positions[KEYS[k]]];
          row[KEYS[k]] = cell ? cellText(cell) : '';
        }
        out.push(row);
      }
      return out;
    } catch (e) { return null; }
  }

  function parseDate(ddmmyyyy) {
    var m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(String(ddmmyyyy || '').trim());
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : null;
  }

  function setRange(from, to) {
    var a = client(DATE_FROM), b = client(DATE_TO);
    var da = parseDate(from), db = parseDate(to);
    if (!a || !b || !da || !db || typeof a.SetDate !== 'function' || typeof b.SetDate !== 'function') return false;
    a.SetDate(da);
    b.SetDate(db);
    return true;
  }

  function listButton() {
    var btn = client(LIST_BUTTON);
    if (btn && typeof btn.DoClick === 'function') return btn;
    // Fallback: any DevExpress button whose caption is "Geçişleri Listele".
    for (var name in window) {
      if (name.indexOf('ctl00_') !== 0) continue;
      var c = client(name);
      try {
        if (c && typeof c.DoClick === 'function' && typeof c.GetText === 'function' &&
            normalize(c.GetText()) === 'GECISLERI LISTELE') return c;
      } catch (e) { /* ignore */ }
    }
    return null;
  }

  function listButtonClick() {
    var btn = listButton();
    if (!btn) return false;
    // The button triggers a full-page postback, not a grid callback. Mark this document as
    // "listing" so isGridBusy() stays true until the reloaded page replaces it.
    window.__trtMesaiListing = true;
    btn.DoClick();
    return true;
  }

  function isGridBusy() {
    try {
      if (window.__trtMesaiListing === true) return true; // postback still pending on this document
      if (document.readyState !== 'complete') return true;
      var grid = client(GRID_ID);
      if (grid && typeof grid.InCallback === 'function' && grid.InCallback()) return true;
      return false;
    } catch (e) { return false; }
  }

  // --- Kişi Tüm Geçişler -------------------------------------------------------------

  // The DevExpress client object of a filter control. Some are registered under the full element
  // id, some under a short name; window[id] can also be the plain DOM element (named access),
  // which has none of the editor methods, so it is skipped.
  function passClient(shortName) {
    var candidates = [PASS_FILTER + shortName, shortName];
    for (var i = 0; i < candidates.length; i++) {
      var c = client(candidates[i]);
      if (c && typeof c.GetValue === 'function') return c;
    }
    return null;
  }

  // Whole days from..to ("dd.MM.yyyy"), all gates. Returns false when a control is missing.
  // The time fields (teBaslangic/teBitis) are left alone: they default to the whole day, and
  // any value set from script made the server drop today's passes (checked live 2026-10-21).
  function setPassRange(from, to) {
    var a = passClient('deTarihBaslangic'), b = passClient('deTarihBitis');
    var da = parseDate(from), db = parseDate(to);
    if (!a || !b || !da || !db || typeof a.SetDate !== 'function' || typeof b.SetDate !== 'function') return false;
    a.SetDate(da);
    b.SetDate(db);
    var all = passClient('cbTumIslemNoktalari');
    if (all && typeof all.SetChecked === 'function' && !all.GetChecked()) {
      all.SetChecked(true);
      if (typeof window.CheckGridLookups === 'function') { try { window.CheckGridLookups(); } catch (e) { /* ignore */ } }
    }
    return true;
  }

  function markStale(el) {
    if (el) el.setAttribute('data-trt-stale', '1');
  }

  // "Listele": refreshes the callback panel with the range set by setPassRange().
  function listPasses() {
    var panel = client('CBPItems') || client(PASS_PANEL);
    if (!panel || typeof panel.PerformCallback !== 'function') return false;
    markStale(byId(PASS_GRID) || byId(PASS_PANEL));
    panel.PerformCallback('List');
    return true;
  }

  function passGrid() {
    var grid = client('gridListe') || client(PASS_GRID);
    return grid && typeof grid.GetPageCount === 'function' ? grid : null;
  }

  // Shows grid page `index` (0-based). Returns false when there is no such page.
  function gotoPassesPage(index) {
    var grid = passGrid();
    if (!grid || index < 0 || index >= grid.GetPageCount()) return false;
    if (grid.GetPageIndex() === index) return true;
    markStale(byId(PASS_GRID + '_DXMainTable'));
    grid.GotoPage(index);
    return true;
  }

  // True once the last listPasses()/gotoPassesPage() callback has replaced the grid.
  function passesSettled() {
    try {
      if (document.readyState !== 'complete') return false;
      var panel = client('CBPItems') || client(PASS_PANEL);
      if (panel && typeof panel.InCallback === 'function' && panel.InCallback()) return false;
      var grid = passGrid();
      if (grid && typeof grid.InCallback === 'function' && grid.InCallback()) return false;
      return !document.querySelector('[data-trt-stale]');
    } catch (e) { return false; }
  }

  // The visible grid page: {rows: [{tarih, tur}], pageIndex, pageCount}, or null when the grid
  // or one of the two columns is missing. Gate names are not read.
  function extractPasses() {
    try {
      var gridEl = byId(PASS_GRID);
      if (!gridEl) return null;
      var headers = gridEl.querySelectorAll('[id^="' + PASS_GRID + '_col"]');
      var positions = {};
      var column = 0;
      for (var h = 0; h < headers.length; h++) {
        if (!/_col\d+$/.test(headers[h].id)) continue;
        var key = PASS_COLUMNS[normalize(cellText(headers[h]).replace(/\[.*?\]/g, ''))];
        if (key) positions[key] = column;
        column++;
      }
      if (positions.tarih === undefined || positions.tur === undefined) return null;
      var rows = gridEl.querySelectorAll('tr[id^="' + PASS_GRID + '_DXDataRow"]');
      var out = [];
      for (var r = 0; r < rows.length; r++) {
        var cells = rows[r].querySelectorAll(':scope > td.dxgv');
        var a = cells[positions.tarih], b = cells[positions.tur];
        out.push({ tarih: a ? cellText(a) : '', tur: b ? cellText(b) : '' });
      }
      var grid = passGrid();
      return {
        rows: out,
        pageIndex: grid ? grid.GetPageIndex() : 0,
        pageCount: grid ? grid.GetPageCount() : 1
      };
    } catch (e) { return null; }
  }

  window.trtMesai = {
    pageState: pageState,
    login: login,
    reportURL: reportURL,
    extractRows: extractRows,
    setRange: setRange,
    listButtonClick: listButtonClick,
    isGridBusy: isGridBusy,
    passesURL: passesURL,
    setPassRange: setPassRange,
    listPasses: listPasses,
    gotoPassesPage: gotoPassesPage,
    passesSettled: passesSettled,
    extractPasses: extractPasses
  };
})();
