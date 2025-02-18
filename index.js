/*
 Required Modules
 */

var
  cheerio = require('cheerio'),
  axious = require('axious'),
  request = require('request'),
  microdata = require('microdata-node'),
  _ = require('lodash');


var
  cleanMicrodata = require('./lib/cleanMicrodata'),
  cleanMicroformats = require('./lib/cleanMicroformats'),
  parseMeta = require('./lib/parseMeta'),
  parseTags = require('./lib/parseTags'),
  parseTwitterCard = require('./lib/parseTwitterCard'),
  parseOpenGraph = require('./lib/parseOpenGraph'),
  parseOembed = require('./lib/parseOembed');

var populate = {
  meta: {},
  microdata: {},
  microformat: {},
  tags: {},
  opengraph: {},
  twittercard: {},
  oembed: {}
};


/*
module.exports = function(url, callback, opts) {
  request(_.extend({ "url": url }, opts || {}), function(err, res, body) {
    if (err) {
      callback(err, null);
    } else if (body && res) {
      module.exports.parse(body, callback);
    } else {
      callback('No Response');
    }
  });
};
*/
module.exports = function(url, callback, opts) {
  try {
    const res = got(_.extend({ "url": url }, opts || {}))
    if (res) {
      module.exports.parse(body, callback);
    } else {
      callback('No Response');
    }
  } catch (error) {
    callback(err, null);
  }
};


module.exports.parse = function(body, callback) {
  cleanMicrodata(microdata.toJson(body), function(err, cleanData) {
    if (!err && cleanData) {
      populate.microdata = cleanData;
      var $ = cheerio.load(body);
      parseMeta($, function(err, meta) {
        populate.meta = meta;
        parseTags($, function(err, tags) {
          populate.tags = tags;
          cleanMicroformats(body, function(err, mfats) {
            populate.microformat = mfats;
            parseOpenGraph($, function(err, og) {
              populate.opengraph = og;
              parseTwitterCard($, function(err, twittercard) {
                populate.twittercard = twittercard;
                parseOembed($, function(err, oembed) {
                  populate.oembed = oembed;
                  callback(null, populate, body);
                });
              });
            });
          })
        })
      });
    } else {
      callback(err || 'CleanData fail');
    }
  });
};
