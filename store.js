/*
 * Seeds Studio — penyimpanan data sementara (localStorage).
 *
 * API-nya sengaja meniru database dokumen sederhana:
 *   SeedsLocalDB.doc("players/abc").set({...}) / .update({...}) / .get() / .delete() / .onSnapshot(fn)
 *   SeedsLocalDB.collection("players").get() / .onSnapshot(fn)
 *
 * Data hanya tersimpan di browser yang dipakai. Saat backend (mis. Supabase) siap,
 * ganti isi file ini dengan pemanggilan ke backend tanpa mengubah halaman.
 */
(function () {
  var KEY = 'seeds-db-v1';
  var UID_KEY = 'seeds-uid';
  var subs = [];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function write(all) {
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { throw { code: 'unavailable', message: 'Penyimpanan browser tidak bisa dipakai.' }; }
    notify();
  }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function docSnap(path, all) {
    var d = all[path];
    return { id: path.split('/').pop(), exists: !!d, data: function () { return clone(d); }, metadata: { fromCache: false, hasPendingWrites: false } };
  }
  function colDocs(path, all) {
    var pre = path + '/';
    return Object.keys(all).filter(function (k) { return k.indexOf(pre) === 0 && k.slice(pre.length).indexOf('/') < 0; })
      .sort().map(function (k) { return docSnap(k, all); });
  }
  function notify() {
    var all = read();
    subs.slice().forEach(function (s) { try { s(all); } catch (e) { console.error(e); } });
  }
  window.addEventListener('storage', function (e) { if (e.key === KEY) notify(); });

  function doc(path) {
    return {
      id: path.split('/').pop(), path: path,
      get: function () { return Promise.resolve(docSnap(path, read())); },
      set: function (data) { var all = read(); all[path] = clone(data); write(all); return Promise.resolve(); },
      update: function (data) {
        var all = read();
        if (!all[path]) return Promise.reject({ code: 'invalid_argument', message: 'Dokumen belum ada.' });
        all[path] = Object.assign({}, all[path], clone(data)); write(all); return Promise.resolve();
      },
      delete: function () { var all = read(); delete all[path]; write(all); return Promise.resolve(); },
      onSnapshot: function (next) {
        var fn = function (all) { next(docSnap(path, all)); };
        subs.push(fn); setTimeout(function () { fn(read()); }, 0);
        return function () { subs = subs.filter(function (s) { return s !== fn; }); };
      }
    };
  }
  function collection(path) {
    return {
      path: path,
      doc: function (id) { return doc(path + '/' + (id || Math.random().toString(36).slice(2, 12))); },
      add: function (data) { var r = this.doc(); return r.set(data).then(function () { return r; }); },
      get: function () { var d = colDocs(path, read()); return Promise.resolve({ docs: d, size: d.length, empty: !d.length }); },
      onSnapshot: function (next) {
        var fn = function (all) { var d = colDocs(path, all); next({ docs: d, size: d.length, empty: !d.length }); };
        subs.push(fn); setTimeout(function () { fn(read()); }, 0);
        return function () { subs = subs.filter(function (s) { return s !== fn; }); };
      }
    };
  }
  function uid() {
    try {
      var id = localStorage.getItem(UID_KEY);
      if (!id) { id = 'local_' + Math.random().toString(36).slice(2, 12); localStorage.setItem(UID_KEY, id); }
      return id;
    } catch (e) { return null; }
  }

  window.SeedsLocalDB = {
    doc: doc, collection: collection, uid: uid,
    exportAll: function () { return read(); },
    importAll: function (obj) { write(obj || {}); },
    reset: function () { write({}); }
  };
})();
