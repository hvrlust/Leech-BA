DROP TABLE users;
CREATE TABLE users
(
    id           integer PRIMARY KEY,
    discord_tag  text    NOT NULL UNIQUE,
    display_name text    NOT NULL DEFAULT 'DEFAULT',
    rsn          text    NOT NULL DEFAULT 'DEFAULT',
    rank         integer NOT NULL DEFAULT 1
);
INSERT into users(discord_tag, display_name, rsn)
VALUES ('test', 'testdisplay', 'testrsn');
ALTER TABLE users
    ADD rank integer NOT NULL DEFAULT 1;

DROP TABLE authentication;
CREATE TABLE authentication
(
    id      integer PRIMARY KEY,
    user_id integer NOT NULL,
    code    text    NOT NULL UNIQUE,
    expiry  NUMERIC NOT NULL DEFAULT (DATETIME('now', '+5 minutes')),
    uses    integer NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE sessions;
CREATE TABLE sessions
(
    id      integer PRIMARY KEY,
    user_id integer NOT NULL,
    session text    NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE editLogs;
CREATE TABLE editLogs
(
    id           integer PRIMARY KEY,
    user_id      integer NOT NULL,
    edit_type_id integer NOT NULL,
    date         integer NOT NULL DEFAULT (DATETIME('now')),
    notes        text,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (edit_type_id) REFERENCES editType (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

DROP TABLE editType;
CREATE TABLE editType
(
    id   integer PRIMARY KEY,
    type text NOT NULL
);
INSERT into editType(type)
VALUES ('added');
INSERT into editType(type)
VALUES ('edited');
INSERT into editType(type)
VALUES ('deleted');

DROP TABLE queue;
CREATE TABLE queue
(
    id       integer PRIMARY KEY,
    date     integer NOT NULL DEFAULT (DATETIME('now')),
    rsn      text    NOT NULL UNIQUE,
    services text    NOT NULL,
    ba       text    NOT NULL,
    notes    text,
    discord  text
);

DROP TABLE mgwQueue;
CREATE TABLE mgwQueue
(
    id       integer PRIMARY KEY,
    date     integer NOT NULL DEFAULT (DATETIME('now')),
    rsn      text    NOT NULL UNIQUE,
    services text    NOT NULL,
    ba       text    NOT NULL,
    notes    text,
    discord  text
);

DROP TABLE mgwEditLogs;
CREATE TABLE mgwEditLogs
(
    id           integer PRIMARY KEY,
    user_id      integer NOT NULL,
    edit_type_id integer NOT NULL,
    date         integer NOT NULL DEFAULT (DATETIME('now')),
    notes        text,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (edit_type_id) REFERENCES editType (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

insert into mgwQueue (id, date, rsn, services, ba, notes, discord)
select *
from queue q
where q.services like '%bxp%';
insert into mgwEditLogs (id, user_id, edit_type_id, date, notes)
select *
from editLogs q
limit 1;

DROP TABLE splits;
CREATE TABLE splits
(
    id    integer PRIMARY KEY,
    mode  text,
    round text,
    host  number,
    att   number,
    col   number,
    def   number,
    heal  number
);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('HM', '2L 1-9 (non ironmen)', 500, 5600, 0, 5450, 5450);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('HM', '2L 1-9 (ironmen)', 500, 6300, 0, 6100, 6100);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('HM', '2L 6-9 (both xp)', 300, 3100, 0, 2950, 2950);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('HM', '2L 6-9 (both pts)', 300, 4100, 0, 3950, 3950);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('HM', '2L 6-9 (1 xp 1 pts)', 300, 3600, 0, 3450, 3450);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('HM', '1L king', 400, 6150, 6000, 6050, 6400);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('HM', '2L king', 500, 7900, 0, 7700, 7900);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('NM', '1L 1-10', 400, 6150, 6000, 6050, 6400);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('NM', '2L 1-10', 500, 7900, 0, 7700, 7900);
INSERT into splits(mode, round, host, att, col, def, heal)
VALUES ('NM', '2L queen', 200, 3950, 0, 3900, 3950);

DROP TABLE requests;
CREATE TABLE requests
(
    id       integer PRIMARY KEY,
    services text NOT NULL,
    approved integer,
    notified integer
);

WITH getId as (select id
               from (SELECT (select count(*) from queue b where a.id >= b.id) as number, id
                     FROM queue a
                     order by number)
               where number = 4)
UPDATE queue
SET id = id + 1
where id > (select id from getId);
update queue
set id = id + 2
where id in (select id from queue order by id desc);


select id
from (SELECT (select count(*) from queue b where a.id >= b.id) as number, id FROM queue a order by number)
where number = 1;


DROP TABLE IF EXISTS commands;
CREATE TABLE commands
(
    id           INTEGER PRIMARY KEY,
    command      TEXT NOT NULL UNIQUE,
    description  TEXT,
    response     TEXT NOT NULL,
    delete_after INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS commands_roles;
CREATE TABLE commands_roles
(
    id         INTEGER PRIMARY KEY,
    command_id INTEGER,
    role       TEXT NOT NULL,
    FOREIGN KEY (command_id) REFERENCES commands (id) ON DELETE CASCADE,
    UNIQUE (command_id, role)
);