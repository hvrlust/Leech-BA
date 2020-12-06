const sqlite3 = require('sqlite3').verbose();
const {console} = require('./utils');

class Database {
    // https://gist.github.com/yizhang82/2ab802f1439490984eb998af3d96b16b
    constructor(path) {
        this.db = new sqlite3.Database(path, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to database.');
            this.db.exec("PRAGMA foreign_keys=ON");
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
                        console.log('sql error: ' + err);
                        reject(false);
                    } else
                        resolve(this);
                });
            });
        };
        this.db.runBatchAsync = function (statements) {
            const that = this;
            const results = [];
            const batch = ['BEGIN', ...statements, 'COMMIT'];
            return batch.reduce((chain, statement) => chain.then(result => {
                results.push(result);
                return that.runAsync(...[].concat(statement));
            }), Promise.resolve())
                .catch(err => that.runAsync('ROLLBACK').then(() => Promise.reject(err +
                    ' in statement #' + results.length)))
                .then(() => results.slice(2));
        };
    }

    async login(code) {
        const row = await this.db.getAsync(`SELECT users.id uid, rsn rsn, display_name dname, uses uses FROM users JOIN authentication ON
                                                 users.id = authentication.user_id WHERE code=? AND expiry>=(DATETIME('now'))`, [code]);
        if (row !== undefined) {
            //increment uses
            await this.db.runAsync(`UPDATE authentication SET uses=? WHERE code=?`, [row.uses + 1, code]);
            if (row.uses + 1 >= 2) {
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
        } catch (error) {
            return 'rsn already exists';
        }
    }

    async deleteCustomer(userId, id, rsn, mgw) {
        try {
            let numberOfChanges;
            if (!mgw) {
                const db = await this.db.runAsync(`DELETE FROM queue WHERE id=?`, [id]);
                numberOfChanges = db.changes;

                await this.db.runAsync(`INSERT INTO editLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 3,
                    rsn]);
            } else {
                const db = await this.db.runAsync(`DELETE FROM mgwqueue WHERE id=?`, [id]);
                numberOfChanges = db.changes;

                await this.db.runAsync(`INSERT INTO mgwEditLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 3,
                    rsn]);
            }
            return numberOfChanges > 0;
        } catch (error) {
            return 'rsn already exists';
        }
    }

    async saveCustomer(userId, request, mgw) {
        try {
            let insertedId;
            if (!mgw) {
                const db = await this.db.runAsync(`UPDATE queue SET date=?, rsn=?, services=?, ba=?, notes=?, discord=? WHERE id=?`,
                    [request.date, request.rsn, JSON.stringify(request.services), request.ba, request.notes, request.discord, request.id]);
                insertedId = db.lastID;
                if (insertedId === undefined) {
                    return 'error'
                }
                await this.db.runAsync(`INSERT INTO editLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 2,
                    request.rsn]);
            } else {
                const db = await this.db.runAsync(`UPDATE mgwQueue SET date=?, rsn=?, services=?, ba=?, notes=?, discord=? WHERE id=?`,
                    [request.date, request.rsn, JSON.stringify(request.services), request.ba, request.notes, request.discord, request.id]);
                insertedId = db.lastID;
                if (insertedId === undefined) {
                    return 'error'
                }
                await this.db.runAsync(`INSERT INTO mgwEditLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 2,
                    request.rsn]);
            }
            return insertedId;
        } catch (error) {
            return 'rsn already exists';
        }
    }

    async newCustomer(userId, request, mgw) {
        try {
            let insertedId;
            if (!mgw) {
                const db = await this.db.runAsync(`INSERT INTO queue(date, rsn, services, ba, notes, discord) VALUES(?,?,?,?,?,?)`,
                    [request.date, request.rsn, JSON.stringify(request.services), request.ba, request.notes, request.discord]);
                insertedId = db.lastID;
                if (insertedId === undefined) {
                    return 'error'
                }

                await this.db.runAsync(`INSERT INTO editLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 1, request.rsn]);
            } else {
                const db = await this.db.runAsync(`INSERT INTO mgwQueue(date, rsn, services, ba, notes, discord) VALUES(?,?,?,?,?,?)`,
                    [request.date, request.rsn, JSON.stringify(request.services), request.ba, request.notes, request.discord]);
                insertedId = db.lastID;
                if (insertedId === undefined) {
                    return 'error'
                }

                await this.db.runAsync(`INSERT INTO mgwEditLogs(user_id, edit_type_id, notes) VALUES(?,?,?)`, [userId, 1, request.rsn]);
            }

            return insertedId;
        } catch (error) {
            return 'rsn already exists';
        }
    }

    async setRsn(discord_id, rsn, display_name) {
        try {
            await this.db.runAsync(`UPDATE users SET rsn=?, display_name=? WHERE discord_tag=?`,
                [rsn, display_name, discord_id]);
            return true;
        } catch (error) {
            console.log(`unable to set rsn for discord_id ${discord_id} and rsn ${rsn}`);
            return false;
        }
    }

    async getRanks() {
        return await this.db.getAllAsync(`SELECT display_name, rsn FROM users WHERE rank=1 and rsn!='DEFAULT' ORDER BY display_name ASC`);
    }

    async getRankDiscordTags() {
        return await this.db.getAllAsync(`SELECT discord_tag FROM users WHERE rank=1`);
    }

    async getLastUpdate(mgw) {
        if (!mgw) {
            return await this.db.getAsync(`SELECT editLogs.id, users.display_name, editType.type, editLogs.date, editLogs.notes
            FROM editLogs join users on users.id = editLogs.user_id join editType on editLogs.edit_type_id = editType.id ORDER BY editLogs.date DESC`);
        } else {
            return await this.db.getAsync(`SELECT mgwEditLogs.id, users.display_name, editType.type, mgwEditLogs.date, mgwEditLogs.notes
            FROM mgwEditLogs join users on users.id = mgwEditLogs.user_id join editType on mgwEditLogs.edit_type_id = editType.id ORDER BY mgwEditLogs.date DESC`);
        }
    }

    async getQueue(mgw) {
        if (!mgw) {
            return await this.db.getAllAsync(`SELECT * FROM queue`);
        } else {
            return await this.db.getAllAsync(`SELECT * FROM mgwQueue`);
        }
    }

    async getSplits() {
        return await this.db.getAllAsync(`SELECT * FROM splits`);
    }

    async generateCode(discordId, discordName) {
        const id = await this.getUserId(discordId, discordName);
        const code = this.makeid();

        const db = await this.db.runAsync(`INSERT INTO authentication(user_id,code) VALUES(?,?)`, [id, code]);
        return db.lastID === undefined ? 'error generating code' : code;
    }

    async getUserId(discordId, discordName) {
        const row = await this.db.getAsync(`SELECT id id FROM users WHERE discord_tag = ?`, [discordId]);

        // if no user exists then create the user
        if (row === undefined) {
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
        return db.changes === undefined ? '0' : db.changes.toString();
    }

    async checkRank(id) {
        const row = await this.db.getAsync(`SELECT id id FROM users WHERE id=? AND rank=1`, [id]);
        if (row) {
            return true
        }
        return false;
    }

    async getRanksWithNoRsnSet() {
        return await this.db.getAllAsync(`SELECT discord_tag FROM users WHERE rsn='DEFAULT' AND rank=1`, []);
    }

    async grantRank(discordId) {
        const db = await this.db.runAsync(`UPDATE users SET rank=1 WHERE discord_tag=? AND rank=0`, [discordId]);
        return db.changes !== 0;
    }

    async revokeRank(discordId) {
        const db = await this.db.runAsync(`UPDATE users SET rank=0 WHERE discord_tag=? AND rank=1`, [discordId]);
        return db.changes !== 0;
    }

    async addCommand(command, roles, text, description, deleteAfter) {
        let response = text.join(" ");
        const statements = [
            [`INSERT INTO commands(command, response, description, delete_after) VALUES (?, ?, ?, ?);`, [command, response, description.join(" "), deleteAfter]]
        ];
        for(const role of roles) {
            statements.push([`INSERT INTO commands_roles(command_id, role) VALUES ((SELECT id FROM commands where command=?), ?);`, [command, role]]);
        }
        const db = await this.db.runBatchAsync(statements);
        return db.changes !== 0;
    }

    //this needs to be a lot smarter..
    // async editCommand(command, roles, text, description, deleteAfter) {
    //     const responseSql = text.length > 0 ?
    //     let response = text.join(" ");
    //     const statements = [
    //         [`INSERT INTO commands(command, response, description, delete_after) VALUES (?, ?, ?, ?);`, [command, response, description.join(" "), deleteAfter]]
    //     ];
    //     statements.push([`DELETE FROM commands_roles WHERE command_id=(SELECT id FROM commands where command=?)`, command]);
    //     for(const role of roles) {
    //         statements.push([`INSERT INTO commands_roles(command_id, role) VALUES ((SELECT id FROM commands where command=?), ?);`, [command, role]]);
    //     }
    //     const db = await this.db.runBatchAsync(statements);
    //     return db.changes !== 0;
    // }

    async removeCommand(command) {
        const db = await this.db.runAsync(`DELETE FROM commands WHERE command=?`, [command]);
        return db.changes !== 0;
    }

    async loadCommands() {
        return await this.db.getAllAsync(`SELECT commands.command, commands.response, commands.description, commands.delete_after, GROUP_CONCAT(roles.role) as roles FROM commands LEFT OUTER JOIN commands_roles roles ON commands.id = roles.command_id GROUP BY commands.id`, []);
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
        let result = '';
        for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
}

module.exports = Database;

