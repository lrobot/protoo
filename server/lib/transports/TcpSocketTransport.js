'use strict';

const EventEmitter = require('events').EventEmitter;
const logger = require('../logger')('TcpSocketTransport');
const Message = require('../Message');

class TcpSocketTransport extends EventEmitter
{
	constructor(socket)
	{
		logger.debug('constructor()');

		super();
		this.setMaxListeners(Infinity);
    // The Node net.Socket instance.
    this._connection = socket;
    this._socket = socket;
    this._remoteaddr = socket.remoteAddress;
    this._remoteport = socket.remotePort;

    this._buff = "";

		// Closed flag.
		this._closed = false;

		// Handle connection.
		this._handleConnection();
	}

	get closed()
	{
		return this._closed;
	}

	toString()
	{
		return (
			this._tostring ||
			(this._tostring =
				`${this._socket.encrypted ? 'WSS' : 'WS'}:[${this._socket.remoteAddress}]:${this._socket.remotePort}`)
		);
	}

	send(message)
	{
		if (this._closed)
			return Promise.reject(new Error('transport closed'));

		try
		{
			this._connection.write(JSON.stringify(message)+"\n");

			return Promise.resolve();
		}
		catch (error)
		{
			logger.error('send() | error sending message: %s', error);

			return Promise.reject(error);
		}
	}

	close()
	{
		logger.debug('close() [conn:%s]', this);

		if (this._closed)
			return;

		// Don't wait for the WebSocket 'close' event, do it now.
		this._closed = true;
		this.emit('close');

		try
		{
			this._connection.close(4000, 'closed by protoo-server');
		}
		catch (error)
		{
			logger.error('close() | error closing the connection: %s', error);
		}
	}

	_handleConnection()
	{
		this._connection.on('close', (code, reason) =>
		{
			if (this._closed)
				return;

			this._closed = true;

			logger.debug(
				'connection "close" event [conn:%s, code:%d, reason:"%s"]',
				this, code, reason);

			// Emit 'close' event.
			this.emit('close');
		});

		this._connection.on('error', (error) =>
		{
			logger.error(
				'connection "error" event [conn:%s, error:%s]', this, error);
		});

		this._connection.on('data', (raw) =>
		{
      this._buff += raw;
      while(true){
        eol_index = this._buff.indexOf('\n');
        if(eol_index==-1) break;
        message = Message.parse(this._buff.substring(0,eol_index))
        // Emit 'message' event.
        if (!message) continue;
        this.emit('message', message);
        this._buff = this._buff.substring(eol_index+1)
      }
		});
	}
}

module.exports = TcpSocketTransport;
