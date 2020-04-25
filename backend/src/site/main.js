exports.run = function (database, getQueueChannel) {
    'use strict';
    const express = require('express');
    const utils = require('../utils');
    const bodyParser = require('body-parser');
    const cookieParser = require('cookie-parser');
    const morgan = require('morgan'); // debugging
    const session = require('cookie-session');
    const compression = require('compression');
    const http = require('http');
    const https = require('https');
    const fs = require('fs');

    // Constants
    const HOST = '0.0.0.0';

    const app = express();
    app.use(compression());

    //app.use('/', router);

    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
    // app.use(morgan('dev'));
    app.use(cookieParser());

    app.use(session({
        name: 'session',
        keys: ['porkpies', 'sausages'],
        maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
    }));

    app.set('database', database);

    const sessionChecker = async (req, res, next) => {
        // checks to see if the user is a rank still
        if (req.session) {
            if (req.session.user) {
                if (await database.checkRank(req.session.user.uid)) {
                    next();
                    return;
                }
            }
        }
        res.redirect('/');
    };

    const root = __dirname + '/dist';
    app.get('/', (req, res) => {
        res.sendFile(root + '/index.html');
    });
    app.get('/calculator', (req, res) => {
        res.sendFile(root + '/index.html');
    });
    app.get('/info', (req, res) => {
        res.sendFile(root + '/index.html');
    });
    app.get('/howtoleech', (req, res) => {
        res.sendFile(root + '/index.html');
    });
    app.get('/queue', sessionChecker, (req, res) => {
        res.sendFile(root + '/index.html');
    });
    app.get('/mgwqueue', (req, res) => {
        res.sendFile(root + '/index.html');
    });
    app.get('/splits', sessionChecker, (req, res) => {
        res.sendFile(root + '/index.html');
    });
    app.use(express.static(root));

    app.route('/login/:oneTimeCode') // autodirects to 404 if empty
        .get(async (req, res) => {
            //check if they're already logged in
            if (req.session.user) {
                res.set('Content-Type', 'text/html');
                res.send('you are already logged in! If you weren\'t supposed to be logged in then logout <a href="/logout">here</a>');
                return;
            }

            const code = req.params.oneTimeCode;
            const user = await database.login(code);

            // check database for active codes
            if (user) {
                //set cookies
                req.session.user = user;
                res.set('Content-Type', 'text/html');
                res.send('login successful, click <a href="/">here</a> to go dashboard');
            } else {
                res.send('login invalid');
            }
        });

    app.get('/logout', async (req, res) => {
        req.session = null;
        await res.json({response: true});
    });

    app.post('/api/deletecustomer', async (req, res) => {
        if (req.session.user) {
            if (req.body.id === undefined) {
                res.status(400).json({error: 'no id specified'});
                return;
            }
            const success = await database.deleteCustomer(req.session.user.uid, req.body.id, req.body.rsn);
            await res.json({response: success});
        } else {
            res.status(403).json({error: 'who are you?'});
        }
    });
    app.post('/api/savecustomer', async (req, res) => {
        if (req.session.user) {
            if (req.body.services.bxp) {
                if (req.body.services.bxp.agility === '' ||
                    req.body.services.bxp.mining === '' ||
                    req.body.services.bxp.firemaking === '' ||
                    Object.keys(req.body.services.bxp).length === 0) {
                    res.status(400).json({error: 'there are null fields'});
                    return;
                }
            }
            const success = await database.saveCustomer(req.session.user.uid, req.body); //TODO add handling for if rsn already exists
            await res.json({response: true});
        } else {
            res.status(403).json({error: 'who are you?'});
        }
    });
    app.post('/api/addcustomer', async (req, res) => {
        if (req.session.user) {
            // TODO more checks
            if (req.body.services.bxp) {
                if (req.body.services.bxp.agility === '' ||
                    req.body.services.bxp.mining === '' ||
                    req.body.services.bxp.firemaking === '' ||
                    Object.keys(req.body.services.bxp).length === 0) {
                    res.status(400).json({error: 'there are null fields'});
                    return;
                }
            }
            const success = await database.newCustomer(req.session.user.uid, req.body); //TODO add handling for if rsn already exists
            await res.json({response: true});
        } else {
            res.status(403).json({error: 'who are you?'});
        }
    });

    app.get('/api/amiloggedin', async (req, res) => {
        if (req.session.user && await database.checkRank(req.session.user.uid)) {
            await res.json({response: true, user: req.session.user['dname']});
        } else {
            await res.json({response: false});
        }
    });

    app.get('/api/ranks', async (req, res) => {
        await res.json({response: await database.getRanks()});
    });

    app.get('/api/queue', async (req, res) => {
        if (req.session.user) {
            await res.json({response: await database.getQueue(), update: await database.getLastUpdate()});
        } else {
            res.status(403).json({error: 'not logged in'});
        }
    });

    app.get('/api/mgw/queue', async (req, res) => {
        if (req.session.user) {
            await res.json({response: await database.getQueue(true), update: await database.getLastUpdate(true)});
        } else {
            res.status(403).json({error: 'not logged in'});
        }
    });

    app.post('/api/mgw/deletecustomer', async (req, res) => {
        if (req.session.user) {
            if (req.body.id === undefined) {
                res.status(400).json({error: 'no id specified'});
                return;
            }
            const success = await database.deleteCustomer(req.session.user.uid, req.body.id, req.body.rsn, true);
            await res.json({response: success});
        } else {
            res.status(403).json({error: 'who are you?'});
        }
    });
    app.post('/api/mgw/savecustomer', async (req, res) => {
        if (req.session.user) {
            // TODO more checks
            if (req.body.services.bxp) {
                if (req.body.services.bxp.agility === '' ||
                    req.body.services.bxp.mining === '' ||
                    req.body.services.bxp.firemaking === '' ||
                    Object.keys(req.body.services.bxp).length === 0) {
                    res.status(400).json({error: 'there are null fields'});
                    return;
                }
            }
            const success = await database.saveCustomer(req.session.user.uid, req.body, true); //TODO add handling for if rsn already exists
            await res.json({response: true});
        } else {
            res.status(403).json({error: 'who are you?'});
        }
    });
    app.post('/api/mgw/addcustomer', async (req, res) => {
        if (req.session.user) {
            // TODO more checks
            if (req.body.services.bxp) {
                if (req.body.services.bxp.agility === '' ||
                    req.body.services.bxp.mining === '' ||
                    req.body.services.bxp.firemaking === '' ||
                    Object.keys(req.body.services.bxp).length === 0) {
                    res.status(400).json({error: 'there are null fields'});
                    return;
                }
            }
            const success = await database.newCustomer(req.session.user.uid, req.body, true); //TODO add handling for if rsn already exists
            await res.json({response: true});
        } else {
            res.status(403).json({error: 'who are you?'});
        }
    });
    app.post('/api/mgw/bottom', async (req, res) => {
        if (req.session.user) {
            if (req.body.id === undefined) {
                res.status(400).json({error: 'no id specified'});
                return;
            }
            const success = await database.bottomCustomer(req.session.user.uid, req.body.id, req.body.rsn);
            res.json({response: success});
        } else {
            res.status(403).json({error: 'who are you?'});
        }
    });

    app.get('/api/splits', async (req, res) => {
        if (req.session.user) {
            await res.json({response: await database.getSplits()});
        } else {
            res.status(403).json({error: 'not logged in'});
        }
    });

    app.get('/api/getlevels/:rsn', async (req, res) => {
        if (req.params.rsn == null) {
            res.send('404');
            return;
        }
        utils.getLevels(req.params.rsn, res);
    });

    app.get('/api/getprice/:id', async (req, res) => {
        if (req.params.id == null) {
            res.send('404');
            return;
        }
        utils.getPrice(req.params.id, res);
    });

    app.get('/api/prune', async (req, res) => {
        const response = await database.pruneAuthenticationCodes();
        res.send(response + ' rows deleted');
    });

    app.get('/api/jiatest', async (req, res) => {
        const response = await database.generateCode(1, 'admin');
        res.send('<a href="http://localhost:8080/login/' + response + '">here</a>');
        //console.log(await database.grantRank('260731133572939776'));
    });


    // legacy stuff
    const legacy = __dirname + '/legacy';
    app.use(express.static(legacy));
    const legacyQueueProcessor = require('./legacy-queue');
    app.post('/legacy/queue', async (req, res) => {
        legacyQueueProcessor.process(req, database, getQueueChannel)
            .then(() => {
                res.sendFile(legacy + '/success.html');
            })
            .catch((e) => {
                console.error("unable to process queue request ", req.body, e);
                res.status(500).send("error");
            });
    });

    app.get('/legacy', (req, res) => {
        res.sendFile(legacy + '/main.html');
    });


    // anything else
    // route for handling 404 requests(unavailable routes)
    app.use(function (req, res, next) {
        res.status(404).send("Cannot find url")
    });

    try {
        const privateKey = fs.readFileSync('/etc/letsencrypt/live/leechba.site/privkey.pem');
        const certificate = fs.readFileSync('/etc/letsencrypt/live/leechba.site/fullchain.pem');
        const credentials = {key: privateKey, cert: certificate};
        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(8443, HOST);
    } catch (error) {
        console.log('unable to start up HTTPS');
        console.log(error);
    }

    const httpServer = http.createServer(app);
    httpServer.listen(8080, HOST);
};
