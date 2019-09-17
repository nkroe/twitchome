'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect('mongodb://localhost/twitchome');

var PromoteClip = new _mongoose.Schema({
    slug: String
});

var PromoteClips = _mongoose2.default.model('PromoteClips', PromoteClip);

exports.default = PromoteClips;