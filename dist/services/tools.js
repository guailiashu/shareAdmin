"use strict";
module.exports = {
    pureIp: (ip) => {
        return ip.indexOf('::ffff:') == 0 ? ip.substring(ip.indexOf('::ffff:') + 7) : ip;
    }
};
