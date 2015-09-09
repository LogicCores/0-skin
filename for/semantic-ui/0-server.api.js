
const PATH = require("path");
const SEND = require("send");


exports.app = function (options) {

    return function (req, res, next) {
    	return SEND(req, req.params[0], {
    		root: PATH.join(__dirname, "node_modules/semantic-ui-css")
    	}).on("error", next).pipe(res);
    }
}
