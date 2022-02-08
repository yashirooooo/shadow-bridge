import path from "path";

let sqlite3 = require('sqlite3').verbose();
var db_path = path.resolve('data/chain.db');

let db = new sqlite3.Database(db_path);

db.serialize(() => {
    const sql = `
        CREATE TABLE IF NOT EXISTS block
        (id integer primary key, number INT)
    `;
    db.run(sql);
});

export default class Block {

    static all(cb: Function) {
        db.all('SELECT * FROM block', cb);
    }

    static find(id: number, cb: Function) {
    	// 使用sqlite3的get
        db.get('SELECT * FROM block WHERE id = ?', id, cb);
    }

    static create(number: number, cb: Function) {
        const sql = `
                INSERT INTO 
                block (number) 
                values (?) 
                ;select last_insert_rowid();`;
        db.run(sql, number, cb);
    }

    static update(id: number, number: number, cb: Function) {
        const sql = `
            UPDATE block
            SET number=?
            WHERE id=?
        `
        db.run(sql, number, id, cb)
    }
}