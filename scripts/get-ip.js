const os = require('os');
const nics = os.networkInterfaces();
let ip = null;

for (const name of Object.keys(nics)) {
    for (const nic of nics[name]) {
        if (nic.family === 'IPv4' && !nic.internal && nic.address.startsWith('192.168.')) {
            ip = nic.address;
            break;
        }
    }
}

if (!ip) {
    for (const name of Object.keys(nics)) {
        for (const nic of nics[name]) {
            if (nic.family === 'IPv4' && !nic.internal) {
                ip = nic.address;
            }
        }
    }
}

console.log(ip);
