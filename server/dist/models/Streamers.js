'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect('mongodb://localhost/twitchome');

var Streamer = new _mongoose.Schema({
    streamersArr: Array
});

var Streamers = _mongoose2.default.model('Streamers', Streamer);

exports.default = Streamers;