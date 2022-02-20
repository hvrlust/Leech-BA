const {console} = require('../utils');

exports.api = function (database) {
    const express = require('express');
    const compression = require('compression');
    const bodyParser = require('body-parser');

    const api = express();
    api.use(compression());

    api.use(bodyParser.json());       // to support JSON-encoded bodies
    api.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));

    api.set('database', database);

    api.post('/api/v1/queue', async (req, res) => {
        if (req.session.user || req.body && await database.isValidApiToken(req.body.token) || req.query && await
            database.isValidApiToken(req.query.token)) {
            await res.json({queue: await database.getQueueV1()});
        } else {
            res.status(403).json({error: 'invalid access'});
        }
    });

    api.get('/api/v2/queue', async (req, res) => {
        if (req.query && await database.isValidApiToken(req.query.token)) {
            await res.json({queue: await database.getQueueV2()});
        } else {
            res.status(403).json({error: 'invalid access'});
        }
    });

    api.post('/api/v2/queue', async (req, res) => {
        if (req.session.user || req.body && await database.isValidApiToken(req.body.token) || req.query && await
            database.isValidApiToken(req.query.token)) {
            await res.json({queue: await database.getQueueV2()});
        } else {
            res.status(403).json({error: 'invalid access'});
        }
    });

    return api;
}