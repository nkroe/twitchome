'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Users = require('./models/Users');

var _Users2 = _interopRequireDefault(_Users);

var _PromoteChannels = require('./models/PromoteChannels');

var _PromoteChannels2 = _interopRequireDefault(_PromoteChannels);

var _PromoteClips = require('./models/PromoteClips');

var _PromoteClips2 = _interopRequireDefault(_PromoteClips);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();

var express = require('express');
var session = require('express-session');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request = require('request');
var handlebars = require('handlebars');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var axios = require('axios');

var TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
var TWITCH_SECRET = process.env.TWITCH_SECRET;
var SESSION_SECRET = process.env.SESSION_SECRET;
var CALLBACK_URL = process.env.BACK + '/auth/twitch/callback';

var app = express();
var acc = '';
var ref = '';
app.use(cors());
app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

_mongoose2.default.connect(process.env.MONGOOSE_CONNECTION);

OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
};

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
  authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
  tokenURL: 'https://id.twitch.tv/oauth2/token',
  clientID: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_SECRET,
  callbackURL: CALLBACK_URL,
  state: true
}, function (accessToken, refreshToken, profile, done) {
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;
  acc = profile.accessToken;
  ref = profile.refreshToken;
  var getUser = new _Users2.default({
    accessToken: profile.accessToken,
    refreshToken: profile.refreshToken,
    Streamers: '',
    id: profile.data[0].id,
    login: profile.data[0].login,
    display_name: profile.data[0].display_name,
    image: profile.data[0].profile_image_url,
    views: profile.data[0].view_count
  });
  _Users2.default.find({ "id": profile.data[0].id }).then(function (data) {
    if (data.length === 0) {
      getUser.save().then(function () {
        (function updateClient() {
          var clientServerOptions = {
            uri: 'https://api.twitch.tv/kraken/users/' + profile.data[0].id + '/follows/channels?limit=50',
            method: 'GET',
            headers: {
              'Client-ID': process.env.CLIENT_ID,
              'Accept': 'application/vnd.twitchtv.v5+json'
            }
          };
          request(clientServerOptions, function (error, response) {
            var arr = [];
            JSON.parse(response.body).follows.forEach(function (w) {
              return arr.push(w.channel.name);
            });
            _Users2.default.updateOne({
              "id": profile.data[0].id
            }, { $set: {
                "Streamers": arr
              }
            }).then(function () {
              console.log('Follows Add');
            });
          });
        })();
        console.log('User add');
      });
    } else {
      _Users2.default.update({
        "id": profile.data[0].id
      }, { $set: {
          "accessToken": profile.accessToken,
          "refreshToken": profile.refreshToken,
          "id": profile.data[0].id,
          "login": profile.data[0].login,
          "display_name": profile.data[0].display_name,
          "image": profile.data[0].profile_image_url,
          "views": profile.data[0].view_count
        }
      }).then(function () {
        console.log('Update done');
      });
    }
  });
  done(null, profile);
}));

app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

app.get('/auth/twitch/callback', passport.authenticate('twitch', { failureRedirect: process.env.FRONT }), function (req, res) {
  res.cookie('accessToken', acc, { maxAge: 21600000, httpOnly: false });
  res.cookie('refreshToken', ref, { maxAge: 21600000, httpOnly: false });
  setTimeout(function (_) {
    res.redirect(process.env.FRONT);
  }, 1000);
});

app.get('/logout', function (req, res) {
  console.log('Logout');
  req.logout();
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.redirect(process.env.FRONT);
});

app.get('/getPormoteChannels', function (req, res) {
  _PromoteChannels2.default.find().then(function (data) {
    return res.send(data);
  });
});

var template = handlebars.compile('\n<html><head><title>Twitch Auth Sample</title></head>\n<table>\n    <tr><th>Access Token</th><td>{{accessToken}}</td></tr>\n    <tr><th>Refresh Token</th><td>{{refreshToken}}</td></tr>\n    <tr><th>Display Name</th><td>{{display_name}}</td></tr>\n    <tr><th>Bio</th><td>{{bio}}</td></tr>\n    <tr><th>Image</th><td>{{logo}}</td></tr>\n</table></html>');

app.get('/', function (req, res) {
  if (req.session && req.session.passport && req.session.passport.user) {
    res.send(template(req.session.passport.user));
  } else {
    res.send('<html><head><title>Twitch Auth Sample</title></head><a href="/auth/twitch"><img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png"></a></html>');
  }
});

app.get('/a/:accessToken', function (req, res) {
  _Users2.default.find({ "accessToken": req.params.accessToken }).then(function (data) {
    res.send(data);
  });
});

app.get('/addStreamer/:accessToken/:streamer', function (req, res) {
  _Users2.default.find({ "accessToken": req.params.accessToken }).then(function (data) {
    var arr = data[0].Streamers;
    if (arr.indexOf(req.params.streamer) === -1) {
      arr.push(req.params.streamer);
    }
    _Users2.default.updateOne({ "Streamers": data[0].Streamers.map }, { $set: { "Streamers": arr } }).then(function (addUpdate) {
      return res.send('Ok ' + addUpdate);
    }).catch(function (e) {
      return console.log('Add ' + e);
    });
  }).catch(function (e) {
    return console.log('Find' + e);
  });
});

app.get('/showAll/:accessToken', function (req, res) {
  _Users2.default.find({ "accessToken": req.params.accessToken }).then(function (data) {
    res.send(data[0].Streamers);
  });
});

app.get('/delete/:accessToken/:streamer', function (req, res) {
  _Users2.default.find({ "accessToken": req.params.accessToken }).then(function (data) {
    var arr = data[0].Streamers;
    arr.splice(arr.indexOf(req.params.streamer), 1);
    _Users2.default.updateOne({ "Streamers": data[0].Streamers.map }, { $set: { "Streamers": arr } }).then(function (dataUpdate) {
      return res.send('Ok ' + dataUpdate);
    }).catch(function (e) {
      return console.log('Update' + e);
    });
  }).catch(function (e) {
    return console.log('Find' + e);
  });
});

app.get('/deleteAll/:accessToken', function (req, res) {
  _Users2.default.find({ "accessToken": req.params.accessToken }).then(function (data) {
    _Users2.default.updateOne({ "Streamers": data[0].Streamers }, { $set: { "Streamers": [] } }).then(function (dataDelete) {
      return res.send('Ok ' + dataDelete);
    }).catch(function (e) {
      return console.log('Delete all' + e);
    });
  }).catch(function (e) {
    return console.log('Find' + e);
  });
});

app.get('/addPromoteChannel/:channel', function (req, res) {
  var _getPromoteOpts = function _getPromoteOpts(url) {
    return {
      method: 'GET',
      url: url,
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Accept': 'application/vnd.twitchtv.v5+json'
      },
      json: true
    };
  };
  axios(_getPromoteOpts('https://api.twitch.tv/kraken/users?login=' + req.params.channel)).then(function (data) {
    if (data.data.users.length !== 0) {
      _PromoteChannels2.default.find({ channel_id: data.data.users[0]._id }).then(function (secData) {
        if (secData.length === 0) {
          axios(_getPromoteOpts('https://api.twitch.tv/kraken/channels/' + data.data.users[0]._id)).then(function (_data) {
            new _PromoteChannels2.default({
              channel_id: _data.data._id,
              name: _data.data.display_name,
              logo: _data.data.logo,
              banner: _data.data.video_banner,
              promoteDate: new Date().getTime()
            }).save().then(function (data) {
              return res.send({ 'status': 'ok' });
            }).catch(function (data) {
              return res.send({ 'error': data });
            });
          });
        } else {
          res.send({ 'status': 'already have' });
        }
      });
    }
  });
});

app.get('/addPromoteClip/:clip', function (req, res) {
  var _getPromoteOpts = function _getPromoteOpts(url) {
    return {
      method: 'GET',
      url: url,
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Accept': 'application/vnd.twitchtv.v5+json'
      },
      json: true
    };
  };
  axios(_getPromoteOpts('https://api.twitch.tv/kraken/clips/' + req.params.clip)).then(function (data) {
    _PromoteClips2.default.find({ slug: req.params.clip }).then(function (secData) {
      if (secData.length === 0) {
        new _PromoteClips2.default({
          slug: data.data.slug
        }).save().then(function (data) {
          return res.send({ 'status': 'ok' });
        }).catch(function (data) {
          return res.send({ 'error': data });
        });
      } else {
        res.send({ 'status': 'already have' });
      }
    });
  }).catch(function (data) {
    res.send({ status: 'Error' });
  });
});

app.get('/getPromoteClips/:clip', function (req, res) {
  if (req.params.clip === 'all') {
    _PromoteClips2.default.find().then(function (data) {
      return res.send(data);
    });
  } else {
    var _getPromoteOpts = function _getPromoteOpts(url) {
      return {
        method: 'GET',
        url: url,
        headers: {
          'Client-ID': process.env.CLIENT_ID,
          'Accept': 'application/vnd.twitchtv.v5+json'
        },
        json: true
      };
    };
    axios(_getPromoteOpts('https://api.twitch.tv/kraken/clips/' + req.params.clip)).then(function (data) {
      res.send(data.data);
    }).catch(function (data) {
      res.send({ status: 'Error' });
    });
  }
});

app.get('/deletePromoteClip/:slug', function (req, res) {
  var _getPromoteOpts = function _getPromoteOpts(url) {
    return {
      method: 'GET',
      url: url,
      headers: {
        'Client-ID': process.env.CLIENT_ID,
        'Accept': 'application/vnd.twitchtv.v5+json'
      },
      json: true
    };
  };
  axios(_getPromoteOpts('https://api.twitch.tv/kraken/clips/' + req.params.slug)).then(function (data) {
    res.send({ status: 'Error' });
  }).catch(function (data) {
    _PromoteClips2.default.deleteOne({
      slug: req.params.slug
    }).then(function (data) {
      res.send({ status: 'ok' });
    }).catch(function (data) {
      return res.send({ status: 'Error' });
    });
  });
});

app.listen(5000, function () {
  console.log('Server is started :)');
});