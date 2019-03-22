const { version } = require('../package.json');
const Room = require('./Room');
const WebSocketServer = require('./transports/WebSocketServer');
const TcpSocketServer = require('./transports/TcpSocketServer');
/**
 * Expose mediasoup version.
 *
 * @type {String}
 */
exports.version = version;

/**
 * Expose Room class.
 *
 * @type {Class}
 */
exports.Room = Room;

/**
 * Expose WebSocketServer class.
 *
 * @type {Class}
 */
exports.WebSocketServer = WebSocketServer;
exports.TcpSocketServer = TcpSocketServer;