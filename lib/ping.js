/**
* Ping library, taken from node-ping and updated to return
* the durations of the ping time
*
* Thanks for the great module:
* (C) Daniel Zelisko
* http://github.com/danielzzz/node-ping
*
*/

var _child = require('child_process');
var _os = require('os');

var _platform = _os.platform();
var _path;
var _options;

if (_platform === 'linux') {
    _path = '/bin/ping';
    _options = ['-n', '-w 2', '-c 1'];
}
else if (_platform.match(/^win/)) {
    _path = 'C:/windows/system32/ping.exe';
    _options = ['-n', '1', '-w', '3000'];
}
else if (_platform === 'darwin') {
    _path = '/sbin/ping';
    _options = ['-n', '-t 2', '-c 1'];
}
else {
    console.error('Your platform is not supported.  We currently support Linux, Windows and OSX');
    process.exit(-1);
}

function pingHost(host, cb) {

    var output = "";
    var ping = null;

    var parameters = _options.slice(0);
    parameters.push(host);

    ping = _child.spawn(_path, parameters);

    ping.on('error', function(err) {
        var error = 'pingcheck: there was an error while executing the ping program. Please check the path or permissions.';
        error += '\npath: ' + _path;
        error += err.toString();
        return cb && cb(error);
    });

    ping.stdout.on('data', function (data) {
        output += String(data);
    });

    ping.stderr.on('data', function (data) {
        output += String(data);
    });

    ping.on('exit', function (code) {

        // if the there was an unknown host return that error
        if (/unknown host/i.test(output))
            return cb && cb('ERROR: The host "' + host + '" was not found');

        // if the there was an unknown host return that error (windows error message)
        if (/could not find host/i.test(output))
            return cb && cb('ERROR: The host "' + host + '" was not found');

        // if there was no output, there was an error, mark it as failed
        if (!output)
            return cb && cb(null);

        // if the process did not exit correctly, the host is down
        if (code !== 0)
            return cb && cb(null);

        // parse the data to get the ping time
        var pingTime;
        output.split('\n').forEach(function(line)
        {
            var time = line.match(/time=([0-9]*\.?[0-9]+)/);
            if (time) {
                pingTime = parseFloat(time[1]);
                return false;
            }
        });
        return cb && cb(null, pingTime);
    });
}

exports.ping = pingHost;
