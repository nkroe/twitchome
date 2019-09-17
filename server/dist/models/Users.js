'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect('mongodb://localhost/twitchome');

var User = new _mongoose.Schema({
    id: String,
    accessToken: String,
    refreshToken: String,
    Streamers: Array,
    user_id: String,
    login: String,
    display_name: String,
    image: String,
    views: String
});

var Users = _mongoose2.default.model('Users', User);

exports.default = Users;