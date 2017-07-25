import express = require('express');
export = {
    pureIp: (ip: string) => {
        return ip.indexOf('::ffff:') == 0 ? ip.substring(ip.indexOf('::ffff:') + 7) : ip;
    }

}



