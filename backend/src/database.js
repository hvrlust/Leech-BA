const sqlite3 = require('sqlite3').verbose();

class Database {
    // https://gist.github.com/yizhang82/2ab802f1439490984eb998af3d96b16b
    constructor() {
        // this.db = new sqlite3.Database('/usr/leechba/database.db', sqlite3.OPEN_READWRITE, (err) => {
        this.db = new sqlite3.Database('./data/database.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to database.');
        });
        this.db.getAsync = function (sql, params) {
            const that = this;
            return new Promise(function (resolve, reject) {
                that.get(sql, params, function (err, row) {
                    if (err) {
                        console.log('sql error: ' + err);
                        reject(false);
                    } else
                        resolve(row);
                });
            });
        };
        this.db.getAllAsync = function (sql, params) {
            const that = this;
            return new Promise(function (resolve, reject) {
                that.all(sql, params, function (err, rows) {
                    if (err) {
                        console.log('sql error: ' + err);
                        reject(false);
                    } else
                        resolve(rows);
                });
            });
        };
        this.db.runAsync = function (sql, params) {
            const that = this;
            return new Promise(function (resolve, reject) {
                that.run(sql, params, function (err) {
                    if (err) {
                        console.log('sql error: '+err);
                        reject(false);
                    } else
                        resolve(this);
                });
            });
        };
    }

    async login(code) {
        const row = await this.db.getAsync(`SELECT users.id uid, rsn rsn, display_name dname, uses uses FROM users JOIN authentication ON
                                                 users.id = authentication.user_id WHERE code=? AND expiry>=(DATETIME('now'))`, [code]);
        if(row!==undefined) {
            //increment uses
            await this.db.runAsync(`UPDATE authentication SET uses=? WHERE code=?`, [row.uses+1, code]);
            if(row.uses+1 >= 2){
                // delete after 2 uses - in case discord scans and consumes a use
                await this.db.runAsync(`DELETE FROM authentication WHERE code=?`, [code]);
            }
            return row;
        } else
            return false;
    }
    async bottomCustomer(userId, id, rsn) {
        try {
            let numberOfChanges;
            let rsn = await this.db.getAsync(`SELECT rsn FROM mgwQueue WHERE id=?`, [id]);
            let db = await this.db.runAsync(`UPDATE mgwQueue SET rsn=? WHERE id=?`, [this.randomString(10, 'abcdefghijklmnop123456'), id]);
            db = await this.db.runAsync(`INSERT INTO mgwQueue (date, rsn, services, ba, notes, discord) SELECT date, ?, services, ba, notes, discord from mgwQueue WHERE id=?`, [rsn.rsn, id]);
            db = await this.db.runAsync(`DELETE FROM mgwQueue WHERE id=?`, [id]);
            numberOfChanges = db.changes;

            this.db.runAsync(`INSERT INTO mgwEditLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 2,
                rsn]);
            return numberOfChanges > 0;
        } catch(error) {
            return 'rsn already exists';
        }
    }

    async deleteCustomer(userId, id, rsn, mgw) {
        try {
            let numberOfChanges;
            if(!mgw) {
                const db = await this.db.runAsync(`DELETE FROM queue WHERE id=?`, [id]);
                numberOfChanges = db.changes;

                this.db.runAsync(`INSERT INTO editLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 3,
                    rsn]);
            } else {
                const db = await this.db.runAsync(`DELETE FROM mgwqueue WHERE id=?`, [id]);
                numberOfChanges = db.changes;

                this.db.runAsync(`INSERT INTO mgwEditLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 3,
                    rsn]);
            }
            return numberOfChanges > 0;
        } catch(error) {
            return 'rsn already exists';
        }
    }
    async saveCustomer(userId, request, mgw) {
        try {
            let insertedId;
            if(!mgw){
                const db = await this.db.runAsync(`UPDATE queue SET date=?, rsn=?, services=?, ba=?, notes=?, discord=? WHERE id=?`,
                    [request.date, request.rsn, JSON.stringify(request.services), request.ba, request.notes, request.discord, request.id]);
                insertedId = db.lastID;
                if (insertedId == undefined) {
                    return 'error'
                }
                this.db.runAsync(`INSERT INTO editLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 2,
                    request.rsn]);
            }else {
                const db = await this.db.runAsync(`UPDATE mgwQueue SET date=?, rsn=?, services=?, ba=?, notes=?, discord=? WHERE id=?`,
                    [request.date, request.rsn, JSON.stringify(request.services), request.ba, request.notes, request.discord, request.id]);
                insertedId = db.lastID;
                if (insertedId == undefined) {
                    return 'error'
                }
                this.db.runAsync(`INSERT INTO mgwEditLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 2,
                    request.rsn]);
            }
            return insertedId;
        } catch(error) {
            return 'rsn already exists';
        }
    }
    async newCustomer(userId, request, mgw) {
        try {
            let insertedId;
            if(!mgw){
                const db = await this.db.runAsync(`INSERT INTO queue(date, rsn, services, ba, notes, discord) VALUES(?,?,?,?,?,?)`,
                    [request.date, request.rsn, JSON.stringify(request.services), request.ba, request.notes, request.discord]);
                insertedId = db.lastID;
                if (insertedId == undefined) {
                    return 'error'
                }

                this.db.runAsync(`INSERT INTO editLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 1, request.rsn]);
            } else {
                const db = await this.db.runAsync(`INSERT INTO mgwQueue(date, rsn, services, ba, notes, discord) VALUES(?,?,?,?,?,?)`,
                    [request.date, request.rsn, JSON.stringify(request.services), request.ba, request.notes, request.discord]);
                insertedId = db.lastID;
                if (insertedId == undefined) {
                    return 'error'
                }

                this.db.runAsync(`INSERT INTO mgwEditLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 1, request.rsn]);
            }

            return insertedId;
        } catch(error) {
            return 'rsn already exists';
        }
    }

    async getLastUpdate(mgw) {
        if(!mgw) {
            const row = await this.db.getAsync(`SELECT editLogs.id, users.display_name, editType.type, editLogs.date, editLogs.notes
            FROM editLogs join users on users.id = editLogs.user_id join editType on editLogs.edit_type_id = editType.id ORDER BY editLogs.date DESC`);
            return row;
        } else{
            const row = await this.db.getAsync(`SELECT mgwEditLogs.id, users.display_name, editType.type, mgwEditLogs.date, mgwEditLogs.notes
            FROM mgwEditLogs join users on users.id = mgwEditLogs.user_id join editType on mgwEditLogs.edit_type_id = editType.id ORDER BY mgwEditLogs.date DESC`);
            return row;
        }
    }
    async getQueue(mgw) {
        if(!mgw) {
            const rows = await this.db.getAllAsync(`SELECT * FROM queue`);
            return rows;
        } else {
            const rows = await this.db.getAllAsync(`SELECT * FROM mgwQueue`);
            return rows;
        }
    }

    async getSplits() {
        const rows = await this.db.getAllAsync(`SELECT * FROM splits`);
        return rows;
    }

    async generateCode(discordId, discordName) {
        const id = await this.getUserId(discordId, discordName);
        const code = this.makeid();

        const db = await this.db.runAsync(`INSERT INTO authentication(user_id,code) VALUES(?,?)`, [id,code]);
        return db.lastID == undefined ? 'error generating code' : code;
    }

    async getUserId(discordId, discordName) {
        const row = await this.db.getAsync(`SELECT id id FROM users WHERE discord_tag = ?`, [discordId]);

        // if no user exists then create the user
        if(row === undefined) {
            const db = await this.db.runAsync(`INSERT INTO users(discord_tag, display_name) VALUES(?,?)`, [discordId, discordName]);
            return db.lastID;
        } else {
            return row.id;
        }
    }

    async pruneAuthenticationCodes() {
        // deletes all codes that have expired
        const db = await this.db.runAsync(`DELETE FROM authentication WHERE expiry<(DATETIME('now'))`, []);
        console.log(`Prune row(s) deleted ${db.changes}`);
        return db.changes === undefined? '0': db.changes.toString();
    }

    async checkRank(id) {
        const row = await this.db.getAsync(`SELECT id id FROM users WHERE id=? AND rank=1`, [id]);
        if(row) {
            return true
        }
        return false;
    }

    async grantRank(discordId) {
        const db = await this.db.runAsync(`UPDATE users SET rank=1 WHERE discord_tag=? AND rank=0`, [discordId]);
        return db.changes !== 0;
    }

    async revokeRank(discordId) {
        const db = await this.db.runAsync(`UPDATE users SET rank=0 WHERE discord_tag=? AND rank=1`, [discordId]);
        return db.changes !== 0;
    }

    close() {
        this.db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    }

    makeid() {
        let text = [];
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 50; i++)
            text.push(possible.charAt(Math.floor(Math.random() * possible.length)));

        return text.join('');
    }
    randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
}

module.exports = Database;

