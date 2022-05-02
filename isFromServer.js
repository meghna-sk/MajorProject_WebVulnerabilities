const whitelist = ['::1', '::ffff:127.0.0.1']

const isFromServer = (req, res, next) => {
    console.log(req.socket.remoteAddress)
    if (whitelist.indexOf(req.ip) !== -1) {
        return next()
    }
    else{
        var err = new Error('IP not allowed');
        err.status = 404;
        return next(err) 
    }
}

module.exports = isFromServer;


