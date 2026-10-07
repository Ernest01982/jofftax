const { DatabaseSync } = require('node:sqlite');

// Only the D1 transport shape is adapted. SQLite itself executes the real SQL,
// constraints, parameter bindings, revision predicate, and RETURNING clauses.
class SQLiteD1 {
  constructor() { this.sqlite = new DatabaseSync(':memory:'); }
  exec(sql) { this.sqlite.exec(sql); }
  close() { this.sqlite.close(); }
  prepare(sql) {
    const statement = this.sqlite.prepare(sql);
    let values = [];
    const wrapped = {
      bind(...args) { values = args; return wrapped; },
      async first(column) {
        const row = statement.get(...values);
        return row ? (column ? row[column] : row) : null;
      },
      async all() {
        const results = statement.all(...values);
        return { success: true, results, meta: { changes: 0 } };
      },
      async run() {
        const result = statement.run(...values);
        return { success: true, results: [], meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) } };
      },
    };
    return wrapped;
  }
}
module.exports = { SQLiteD1 };
