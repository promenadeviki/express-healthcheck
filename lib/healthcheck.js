function formatUptime(uptime) {
	const date = new Date(uptime * 1000);
	const units = {
        year: date.getUTCFullYear() - 1970,
		month: date.getUTCMonth(),
		day: date.getUTCDate() - 1,
		hour: date.getUTCHours(),
		minute: date.getUTCMinutes(),
		second: date.getUTCSeconds(),
		millisecond: date.getUTCMilliseconds(),
    }
	return Object.entries(units)
        .map(([unit, value])=> value ? `${value} ${unit}${value > 1 ? 's': ''}` : '')
        .filter((v)=>v)
        .join(', ')
}

/*
function formatUptime(uptime) {
	const date = new Date(uptime * 1000);
	const years = date.getUTCFullYear() - 1970,
		months = date.getUTCMonth(),
		days = date.getUTCDate() - 1,
		hours = date.getUTCHours(),
		minutes = date.getUTCMinutes(),
		seconds = date.getUTCSeconds(),
		milliseconds = date.getUTCMilliseconds();
	let time = [];

    if (years > 0) time.push(years + ' year' + ((years == 1) ? '' : 's'));
    if (months > 0) time.push(months + ' month' + ((months == 1) ? '' : 's'));
    if (days > 0) time.push(days + ' day' + ((days == 1) ? '' : 's'));
    if (hours > 0) time.push(hours + ' hour' + ((hours == 1) ? '' : 's'));
    if (minutes > 0) time.push(minutes + ' minute' + ((minutes == 1) ? '' : 's'));
    if (seconds > 0) time.push(seconds + ' second' + ((seconds == 1) ? '' : 's'));
    if (milliseconds > 0) time.push(milliseconds + ' millisecond' + ((seconds == 1) ? '' : 's'));

    return time.join(', ');
}

*/


module.exports = function (options) {
    options = options || {};
    options.test = options.test || function () {};
    if (typeof options.test !== 'function') {
        throw new Error('express-healthcheck `test` method must be a function');
    }
    options.healthy = options.healthy || function () {
        return { uptime: formatUptime(process.uptime()) };
    };
    if (typeof options.healthy !== 'function') {
        throw new Error('express-healthcheck `healthy` method must be a function');
    }
    if (options.test.length === 0) {
        var test = options.test;
        options.test = function (callback) {
            callback(test());
        };
    }
    return function (req, res, next) {
        try {
            options.test(function (err) {
                var status = 200,
                    response = options.healthy();
                if (err) {
                    status = 500;
                    response = err;
                }
                res.status(status).json(response);
            });
        } catch (e) {
            res.status(500).json(e);
        }
    };
};
