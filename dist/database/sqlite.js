"use strict";
var sqlite3 = require('sqlite3');
class SQLiteDatabase {
    constructor(options) {
        this.options = options;
        let path = process.cwd() + options.databaseConfig.sqlite.databasePath;
        this._sqlite = new sqlite3.cached.Database(path);
        this._sqlite.serialize(() => {
            this._sqlite.run('CREATE TABLE IF NOT EXISTS key_value (key VARCHAR(255), value TEXT)');
            this._sqlite.run('CREATE UNIQUE INDEX key_index ON key_value (key)');
        });
    }
    get(key) {
        return new Promise((resolve, reject) => {
            this._sqlite.get("SELECT value FROM key_value WHERE key = $key", {
                $key: key,
            }, (error, row) => {
                if (error) {
                    reject(error);
                }
                let result = row ? JSON.parse(row.value) : null;
                resolve(result);
            });
        });
    }
    set(key, value) {
        this._sqlite.run("INSERT OR REPLACE INTO key_value (key, value) VALUES ($key, $value)", {
            $key: key,
            $value: JSON.stringify(value)
        });
    }
}
exports.SQLiteDatabase = SQLiteDatabase;
