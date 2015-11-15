
exports.forLib = function (LIB) {
    
    var exports = {};

    exports.app = function (options) {

        return function (req, res, next) {
    
            var sourcePath = LIB.path.join(__dirname, "node_modules/semantic-ui-css", req.params[0].replace(/\.dist(\.css)$/, "$1"));
	        var distPath = LIB.path.join(options.distPath, req.params[0]);

	        function respond () {
				res.writeHead(200, {
					"Content-Type": "text/css"
				});
	           	return LIB.fs.createReadStream(distPath).pipe(res);
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
		           	return respond();
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

        		           	return respond();
                        });
                    });
    
                } else {
                	return LIB.send(req, LIB.path.basename(sourcePath), {
                		root: LIB.path.dirname(sourcePath)
                	}).on("error", next).pipe(res);
                }
			});
        }
    }

    return exports;
}
