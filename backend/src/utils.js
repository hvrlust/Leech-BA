const request = require("request");
const cheerio = require('cheerio');

module.exports = {
  getLevels: function (user, callback) {
    request('http://services.runescape.com/m=hiscore/index_lite.ws?player=' + user, function (error, response, html) {
      if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);

        callback.send($.text());
      }
    });
  },

  getPrice: function (id, callback) {
    request('http://services.runescape.com/m=itemdb_rs/api/graph/' + id + '.json', function (error, response, html) {
      if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);

        callback.send($.text());
      }
    });
  },
};