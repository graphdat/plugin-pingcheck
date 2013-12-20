var _async = require('async');
var _tools = require('graphdat-plugin-tools');

var _param = require('./param.json');
var _ping = require('./lib/ping');

var HOST_IS_DOWN = -1;

// if we do not have a poll Interval for the plugin set it
// each host has its own poll interval
var _pollInterval = _param.pollInterval || 1000;

// keep track of the host's last polled time so we don't hammer the host
var _previous = {};

function logSuccess(source, duration) {
    console.log('PING_RESPONSETIME %d %s', duration, source);
}

function logFailure(err, source, duration) {
    if (err)
        console.error(err);
    else
        console.log('PING_RESPONSETIME %d %s', HOST_IS_DOWN, source);
}

function complete(err) {
    if (err) console.eror(err);
}

// ping a host and report back
function pingHost(host, cb) {

    // check if we need to poll again
    var last = _previous[host.source] || 0;
    var now = Date.now();
    var source = host.source;

    if ((last + host.pollInterval) > now)
        return cb(null);
    else
        _previous[source] = now;

    // ping the host
    _ping.ping(host.host, function(err, responseTime)
    {
        if (err)
            logFailure(err, source, responseTime);
        else if (responseTime === null || responseTime === undefined || responseTime < 0)
            logFailure(null, source, responseTime);
        else
            logSuccess(source, responseTime);

        return cb(null);
    });
}

// validate we have Hosts to ping
if (!_param.items) {
    console.error('No configuration has been setup yet, so we\'re exiting');
    process.exit(1);
}

// validate the hosts intervals
_param.items.forEach(function(host) {

    // set the poll interval in case it was set too low
    var pollInterval = parseFloat(host.pollInterval, 10) || 5;
    pollInterval = pollInterval * 1000; // turn into ms
    if (pollInterval < 1000) // incase the user entered the wrong units
        pollInterval = 1000;

    host.pollInterval = pollInterval;
});

function poll() {
    _async.each(_param.items, pingHost, complete);
    setTimeout(poll, _pollInterval);
}

// lets get the party started
poll();
