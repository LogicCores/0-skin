
exports.forLib = function (LIB) {
    var ccjson = this;
    
    const ESCAPE_REGEXP_COMPONENT = require("escape-regexp-component");

    return LIB.Promise.resolve({
        forConfig: function (defaultConfig) {

            var Entity = function (instanceConfig) {
                var self = this;
                var config = {};
                LIB._.merge(config, defaultConfig)
                LIB._.merge(config, instanceConfig)

                self.AspectInstance = function (aspectConfig) {

                    return LIB.Promise.resolve({
                        app: function () {

                            return LIB.Promise.resolve(
                                ccjson.makeDetachedFunction(
                                    function (req, res, next) {

                                        return LIB.fs.readFile(LIB.path.join(config.basePath, req.params[0]), "utf8", function (err, html) {
                                            if (err) return next(err);
     
                                            // We convert the namespaced 'component' attributes as jQuery has a hard
                                            // time selcting attributes with colons in it. Likely true for many other
                                            // parsers as well.
                        						var re = /(<|\s)component\s*:\s*([^=]+)(\s*=\s*"[^"]*"(?:\/?>|\s))/g;
                    						var m;
                    						while ( (m = re.exec(html)) ) {
                    							html = html.replace(
                    							    new RegExp(ESCAPE_REGEXP_COMPONENT(m[0]), "g"),
                    							    m[1] + "data-component-" + m[2].replace(/:/g, "-") + m[3]
                    							);
                    						}
                                            res.writeHead(200, {
                                                "Content-Type": "text/html"
                                            });
                                            res.end(html);
                                            return;
                                        });
                                    }
                                )
                            );
                        }
                    });
                }
            }
            Entity.prototype.config = defaultConfig;

            return Entity;
        }
    });
}
