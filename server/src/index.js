import mongoose from 'mongoose';
import Users from './models/Users';
import PromoteChannels from './models/PromoteChannels';
import PromoteClips from './models/PromoteClips';

require('dotenv').config();

var express        = require('express');
var session        = require('express-session');
var passport       = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request        = require('request');
var handlebars     = require('handlebars');
var cors           = require('cors');
var cookieParser   = require('cookie-parser');
var axios          = require('axios');

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET    = process.env.TWITCH_SECRET;
const SESSION_SECRET   = process.env.SESSION_SECRET;
const CALLBACK_URL     = `${process.env.BACK}/auth/twitch/callback`;

var app = express();
var acc = '';
var ref = '';
app.use(cors());
app.use(session({secret: SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

mongoose.connect(process.env.MONGOOSE_CONNECTION);

OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
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
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_SECRET,
    callbackURL: CALLBACK_URL,
    state: true
  },
  function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    acc = profile.accessToken;
    ref = profile.refreshToken;
    const getUser = new Users({
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      Streamers: '',
      id: profile.data[0].id,
      login: profile.data[0].login,
      display_name: profile.data[0].display_name,
      image: profile.data[0].profile_image_url,
      views: profile.data[0].view_count,
      balance: '0'
  });
  Users.find({ "id": profile.data[0].id }).then((data)=>{
    if (data.length === 0) {
      getUser.save().then(()=> {
        (function updateClient(){
                   var clientServerOptions = {
                       uri: `https://api.twitch.tv/kraken/users/${profile.data[0].id}/follows/channels?limit=100`,
                       method: 'GET',
                       headers: {
                        'Client-ID': process.env.CLIENT_ID,
                        'Accept': 'application/vnd.twitchtv.v5+json'
                     },
                   }
                   request(clientServerOptions, function (error, response) {
                     var arr = [];
                     JSON.parse(response.body).follows.forEach(w=>arr.push(w.channel.name));
                     Users.updateOne(
                      {
                        "id": profile.data[0].id
                      },
                      { $set: 
                        {
                          "Streamers": arr
                        }
                      }
                    ).then(()=>{
                      console.log('Follows Add');
                    })
                   });
               })();
        console.log('User add');
      });
    } else {
      Users.update(
        {
          "id": profile.data[0].id
        },
        { $set: 
          {
            "accessToken": profile.accessToken,
            "refreshToken": profile.refreshToken,
            "login": profile.data[0].login,
            "display_name": profile.data[0].display_name,
            "image": profile.data[0].profile_image_url,
            "views": profile.data[0].view_count
          }
        }
      ).then(()=>{
        console.log('Update done');
      })
    }
  });
    done(null, profile);
  }
));

app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

app.get('/auth/twitch/callback', 
  passport.authenticate('twitch', {failureRedirect: process.env.FRONT }),
  function(req, res) {
    res.cookie('accessToken', acc, { maxAge: 21600000, httpOnly: false});
    res.cookie('refreshToken', ref, { maxAge: 21600000, httpOnly: false});
    setTimeout(_=>{
      res.redirect(process.env.FRONT);
    }, 1000);
  }
);

app.get('/logout',
  function(req, res) {
    console.log('Logout');
    req.logout();
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.redirect(process.env.FRONT);
  }
);

app.get('/getPormoteChannels', (req, res) => {
    PromoteChannels.find().then(data => res.send(data));
  }
);

var template = handlebars.compile(`
<html><head><title>Twitch Auth Sample</title></head>
<table>
    <tr><th>Access Token</th><td>{{accessToken}}</td></tr>
    <tr><th>Refresh Token</th><td>{{refreshToken}}</td></tr>
    <tr><th>Display Name</th><td>{{display_name}}</td></tr>
    <tr><th>Bio</th><td>{{bio}}</td></tr>
    <tr><th>Image</th><td>{{logo}}</td></tr>
</table></html>`);

app.get('/', function (req, res) {
  if(req.session && req.session.passport && req.session.passport.user) {
    res.send(template(req.session.passport.user));
  } else {
    res.send('<html><head><title>Twitch Auth Sample</title></head><a href="/auth/twitch"><img src="http://ttv-api.s3.amazonaws.com/assets/connect_dark.png"></a></html>');
  }
});

app.get('/a/:accessToken', (req, res) =>{
  Users.find({ "accessToken": req.params.accessToken}).then((data)=>{
    res.send(data);
  })
});

app.get('/addStreamer/:accessToken/:streamer', (req, res) =>{
  Users.find({ "accessToken": req.params.accessToken }).then((data)=>{
    if (data.length !== 0) {
      let arr = data[0].Streamers.concat(req.params.streamer);
      Users.updateOne(
        { 
          "id" : data[0].id
        },
        { 
          $set: {
            "Streamers" : arr
          } 
        }
      ).then(dataUpdate => res.send('Ok'))
       .catch(e => {
          console.log('Update error: ' + e);
          res.send('Update error');
       });
    }
  }).catch(e => {
    console.log('Find error: ' + e);
    res.send('Find error');
  });
});

app.get('/showAll/:accessToken', (req, res) =>{
  Users.find({ "accessToken": req.params.accessToken }).then((data)=>{
      res.send(data[0].Streamers);
    })
});

app.get('/delete/:accessToken/:streamer', (req, res) =>{
  Users.find({ "accessToken": req.params.accessToken }).then((data)=>{
      if (data.length !== 0) {
        let arr = data[0].Streamers.filter(elem => elem !== req.params.streamer);
        Users.updateOne(
          { 
            "id" : data[0].id
          },
          { 
            $set: {
              "Streamers" : arr
            } 
          }
        ).then(dataUpdate => res.send('Ok'))
         .catch(e => {
            console.log('Update error: ' + e);
            res.send('Update error');
         });
      }
    }).catch(e => {
      console.log('Find error: ' + e);
      res.send('Find error');
    });
  });

  app.get('/deleteAll/:accessToken', (req, res) =>{
    Users.find({ "accessToken": req.params.accessToken }).then((data)=>{
      if (data.length !== 0) {
        Users.updateOne(
          { 
            "id" : data[0].id
          },
          { 
            $set: {
              "Streamers" : []
            } 
          }
        ).then(dataUpdate => res.send('Ok'))
         .catch(e => {
            console.log('Update error: ' + e);
            res.send('Update error');
         });
      }
    }).catch(e => {
      console.log('Find error: ' + e);
      res.send('Find error');
    });
  });

  app.get('/addPromoteChannel/:channel', (req, res) => {
    var _getPromoteOpts = url => {
      return {
        method: 'GET',
        url: url,
        headers: {
          'Client-ID': process.env.CLIENT_ID,
          'Accept': 'application/vnd.twitchtv.v5+json'
        },
        json: true
      }
    }
    axios(_getPromoteOpts(`https://api.twitch.tv/kraken/users?login=${req.params.channel}`)).then(data => {
      if (data.data.users.length !== 0) {
        PromoteChannels.find({ channel_id: data.data.users[0]._id }).then(secData => {
          if (secData.length === 0) {
            axios(_getPromoteOpts(`https://api.twitch.tv/kraken/channels/${data.data.users[0]._id}`)).then(_data => {
              new PromoteChannels({
                channel_id: _data.data._id,
                name: _data.data.display_name,
                logo: _data.data.logo,
                banner: _data.data.video_banner,
                promoteDate: new Date().getTime()
              }).save().then(data => res.send({'status': 'ok'})).catch(data => res.send({'error': data}));
            })
          } else {
            res.send({'status':'already have'});
          }
        })
      }
    })
  })

  app.get('/addPromoteClip/:clip', (req, res) => {
    var _getPromoteOpts = url => {
      return {
        method: 'GET',
        url: url,
        headers: {
          'Client-ID': process.env.CLIENT_ID,
          'Accept': 'application/vnd.twitchtv.v5+json'
        },
        json: true
      }
    }
    axios(_getPromoteOpts(`https://api.twitch.tv/kraken/clips/${req.params.clip}`)).then(data => {
        PromoteClips.find({ slug: req.params.clip }).then(secData => {
          if (secData.length === 0) {
              new PromoteClips({
                slug: data.data.slug
              }).save().then(data => res.send({'status': 'ok'})).catch(data => res.send({'error': data}));
          } else {
            res.send({'status':'already have'});
          }
        })
    }).catch(data => {
      res.send({status: 'Error'});
    })
  })

  app.get('/getPromoteClips/:clip', (req, res) => {
    if (req.params.clip === 'all') {
      PromoteClips.find().then(data => res.send(data));
    } else {
      var _getPromoteOpts = url => {
        return {
          method: 'GET',
          url: url,
          headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Accept': 'application/vnd.twitchtv.v5+json'
          },
          json: true
        }
      }
      axios(_getPromoteOpts(`https://api.twitch.tv/kraken/clips/${req.params.clip}`)).then(data => {
        res.send(data.data);
      }).catch(data => {
        res.send({status: 'Error'});
      })
    }
  })

  app.get('/deletePromoteClip/:slug', (req, res) => {
    var _getPromoteOpts = url => {
      return {
        method: 'GET',
        url: url,
        headers: {
          'Client-ID': process.env.CLIENT_ID,
          'Accept': 'application/vnd.twitchtv.v5+json'
        },
        json: true
      }
    }
    axios(_getPromoteOpts(`https://api.twitch.tv/kraken/clips/${req.params.slug}`)).then(data => {
      res.send({status: 'Error'});
    }).catch(data => {
      PromoteClips.deleteOne({
        slug: req.params.slug
      }).then(data => {
        res.send({status: 'ok'})
      }).catch(data => res.send({status: 'Error'}))
    })
  })

app.listen(5000, function () {
  console.log('Server is started :)')
});
