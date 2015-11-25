
exports.forLib = function (LIB) {
    
    var exports = {};

    exports.app = function (options) {

        return function (req, res, next) {
    
            var sourcePath = LIB.path.join(__dirname, "node_modules/semantic-ui-css", req.params[0].replace(/\.dist(\.css)$/, "$1"));
	        var distPath = LIB.path.join(options.distPath, req.params[0]);

	        function respond (path) {
            	return LIB.send(req, LIB.path.basename(path), {
            		root: LIB.path.dirname(path),
        		    maxAge: options.clientCacheTTL || 0
            	}).on("error", next).pipe(res);
	        }

			return LIB.fs.exists(distPath, function (exists) {

		        if (
		        	exists &&
		        	(
		        		/\.dist\./.test(distPath) ||
		        		options.alwaysRebuild === false
		        	)
		        ) {
		           	// We return a pre-built file if it exists and are being asked for it
		           	return respond(distPath);
		        }

                if (/\.no-media\.css$/.test(sourcePath)) {
                    
                    return LIB.fs.readFile(sourcePath.replace(/\.no-media(\.css)$/, "$1"), "utf8", function (err, css) {
                        if (err) return next(err);

                        const REWORK = require("rework");
                        const REWORK_CSS_QUERYLESS = require("css-queryless");

                        var output = REWORK(css)
                        // TODO: Make options configurable.
            			.use(REWORK_CSS_QUERYLESS([
                            'screen and (min-width: 767px)'
                        ]));

                        return LIB.fs.outputFile(distPath, output.toString(), "utf8", function (err) {
                            if (err) return next(err);

        		           	return respond(distPath);
                        });
                    });
    
                } else {
		           	return respond(sourcePath);
                }
			});
        }
    }

    return exports;
}
