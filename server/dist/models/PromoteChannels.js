'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect('mongodb://localhost/twitchome');

var PromoteChannel = new _mongoose.Schema({
    channel_id: String,
    name: String,
    logo: String,
    banner: String,
    promoteDate: String
});

var PromoteChannels = _mongoose2.default.model('PromoteChannels', PromoteChannel);

exports.default = PromoteChannels;