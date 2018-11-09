'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GenericDatasource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GenericDatasource = exports.GenericDatasource = function () {
    function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
        _classCallCheck(this, GenericDatasource);

        this.type = instanceSettings.type;
        this.url = instanceSettings.url;
        this.name = instanceSettings.name;
        this.q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        this.withCredentials = instanceSettings.withCredentials;
        this.headers = { 'Content-Type': 'application/json' };
        if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
            this.headers['Authorization'] = instanceSettings.basicAuth;
        }
    }

    _createClass(GenericDatasource, [{
        key: 'getRegions',
        value: function getRegions() {
            var response = this.doRequest({
                url: this.url + '/monitoring/regions',
                method: 'GET'
            }).then(function (result) {
                return result.data;
            });

            return response;
        }
    }, {
        key: 'getRegion',
        value: function getRegion(regionId) {
            var response = this.doRequest({
                url: this.url + '/monitoring/regions/' + regionId,
                method: 'GET'
            }).then(function (result) {
                return result.data;
            }).catch(function (reason) {
                console.log(reason.data);
                return reason.data;
            });

            return response;
        }
    }, {
        key: 'getServices',
        value: function getServices(regionId) {
            var response = this.doRequest({
                url: this.url + '/monitoring/regions/' + regionId + '/services',
                method: 'GET'
            }).then(function (result) {
                return result.data;
            });

            return response;
        }

        //   Returns data from Federation Monitoring APIs if the target is: map_points (Map panel), servicesTableJSON (table panel), totalVMs (single stat panel), totalIPs (single stat panel) or totalCores (single stat panel)

    }, {
        key: 'query',
        value: function query(options) {
            var _this = this;

            var query = this.buildQueryParameters(options);
            query.targets = query.targets.filter(function (t) {
                return !t.hide;
            });

            if (query.targets.length <= 0) {
                return this.q.when({ data: [] });
            }

            var current_target = null;
            if ("target" in query.targets[0]) current_target = query.targets[0]["target"];

            if (current_target == "map_points") {
                //         return {"data":[{"key": "ES","latitude": 40.416775,"longitude": -3.70379,"name": "Spain"},{"key": "GR","latitude": 35.53,"longitude": 24.06,"name": "Crete"}]};

                var response = { "data": [] };
                var regions_ids = [];
                return this.getRegions().then(function (result) {
                    var result_data = result;
                    var regions_ids = result_data["_embedded"]["regions"];

                    return Promise.all(regions_ids.map(function (obj) {
                        return _this.getRegion(obj["id"]);
                    })).then(function (data) {
                        var allResults = data;
                        console.log(allResults);

                        for (var i = 0; i < allResults.length; i++) {
                            var result_data = allResults[i];

                            var regionData = null;
                            if ("data" in result_data) {
                                regionData = {
                                    "key": result_data["name"],
                                    "latitude": parseFloat(result_data["data"][1]),
                                    "longitude": parseFloat(result_data["data"][2]),
                                    "name": result_data["name"],
                                    "value": 0
                                };
                            } else {
                                regionData = {
                                    "key": result_data["name"],
                                    "latitude": parseFloat(result_data["latitude"]),
                                    "longitude": parseFloat(result_data["longitude"]),
                                    "name": result_data["name"],
                                    "value": 5
                                };
                            }
                            if (regionData) {
                                response["data"].push(regionData);
                            }
                            console.log("pushing region data in response");
                            console.log(regionData);
                        }

                        console.log("returning:...");
                        console.log(response);
                        return response;
                    });
                }).then(function (result) {
                    return result;
                });
            } else if (current_target == "servicesTableJSON") {
                var response = { "data": [{
                        "type": "table",
                        "columns": [{ "text": "Node", "type": "string" }, { "text": "Nova", "type": "number" }, { "text": "Neutron", "type": "number" }, { "text": "Cinder", "type": "number" }, { "text": "Glance", "type": "number" }, { "text": "Sanity", "type": "number" }],
                        "rows": []

                    }] };

                var rows = [];
                var regions_ids = [];
                return this.getRegions().then(function (result) {
                    var result_data = result;
                    var regions_ids = result_data["_embedded"]["regions"];

                    return Promise.all(regions_ids.map(function (obj) {
                        return _this.getServices(obj["id"]);
                    })).then(function (data) {
                        var allResults = data;
                        console.log(allResults);
                        var rows = [];
                        for (var i = 0; i < allResults.length; i++) {
                            var result_data = allResults[i];

                            var measures = result_data["measures"][0];

                            var novaServiceStatus, neutronServiceStatus, cinderServiceStatus, glanceServiceStatus, FiHealthStatus;
                            novaServiceStatus = neutronServiceStatus = cinderServiceStatus = glanceServiceStatus = FiHealthStatus = null;

                            if (measures["novaServiceStatus"]["value_clean"] != "undefined") novaServiceStatus = parseFloat(measures["novaServiceStatus"]["value_clean"]);
                            if (measures["neutronServiceStatus"]["value_clean"] != "undefined") neutronServiceStatus = parseFloat(measures["neutronServiceStatus"]["value_clean"]);
                            if (measures["cinderServiceStatus"]["value_clean"] != "undefined") cinderServiceStatus = parseFloat(measures["cinderServiceStatus"]["value_clean"]);
                            if (measures["glanceServiceStatus"]["value_clean"] != "undefined") glanceServiceStatus = parseFloat(measures["glanceServiceStatus"]["value_clean"]);
                            if (measures["FiHealthStatus"]["value_clean"] != "undefined") FiHealthStatus = parseFloat(measures["FiHealthStatus"]["value_clean"]);

                            var arrayResult = [result_data["id"], novaServiceStatus, neutronServiceStatus, cinderServiceStatus, glanceServiceStatus, FiHealthStatus];
                            rows.push(arrayResult);
                            console.log("pushing array in rows");
                            console.log(arrayResult);
                        }
                        response["data"][0]["rows"] = rows;
                        console.log("returning:...");
                        console.log(response);
                        return response;
                    });
                }).then(function (result) {
                    return result;
                });
            } else if (current_target == "totalVMs") {
                return this.getRegions().then(function (result) {
                    var result_data = result;
                    var total_nb_vm = parseInt(result_data["total_nb_vm"]);
                    return { "data": [{ "target": current_target, "datapoints": [[total_nb_vm, Math.round(new Date().getTime() / 1000)]] }] };
                });
            } else if (current_target == "totalIPs") {
                return this.getRegions().then(function (result) {
                    var result_data = result;
                    var total_ip = parseInt(result_data["total_ip"]);
                    return { "data": [{ "target": current_target, "datapoints": [[total_ip, Math.round(new Date().getTime() / 1000)]] }] };
                });
            } else if (current_target == "totalCores") {
                return this.getRegions().then(function (result) {
                    var result_data = result;
                    var total_nb_cores = parseInt(result_data["total_nb_cores"]);
                    return { "data": [{ "target": current_target, "datapoints": [[total_nb_cores, Math.round(new Date().getTime() / 1000)]] }] };
                });
            } else {

                if (this.templateSrv.getAdhocFilters) {
                    query.adhocFilters = this.templateSrv.getAdhocFilters(this.name);
                } else {
                    query.adhocFilters = [];
                }

                return this.doRequest({
                    url: this.url + '/query',
                    data: query,
                    method: 'POST'
                });
            }
        }
    }, {
        key: 'testDatasource',
        value: function testDatasource() {
            return this.doRequest({
                url: this.url + '/',
                method: 'GET'
            }).then(function (response) {
                if (response.status === 200) {
                    return { status: "success", message: "Data source is working", title: "Success" };
                }
            });
        }
    }, {
        key: 'annotationQuery',
        value: function annotationQuery(options) {
            var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
            var annotationQuery = {
                range: options.range,
                annotation: {
                    name: options.annotation.name,
                    datasource: options.annotation.datasource,
                    enable: options.annotation.enable,
                    iconColor: options.annotation.iconColor,
                    query: query
                },
                rangeRaw: options.rangeRaw
            };

            return this.doRequest({
                url: this.url + '/annotations',
                method: 'POST',
                data: annotationQuery
            }).then(function (result) {
                return result.data;
            });
        }
    }, {
        key: 'metricFindQuery',
        value: function metricFindQuery(query) {
            //     var interpolated = {
            //         target: this.templateSrv.replace(query, null, 'regex')
            //     };
            //
            //     return this.doRequest({
            //       url: this.url + '/search',
            //       data: interpolated,
            //       method: 'POST',
            //     }).then(this.mapToTextValue);
            //       console.log(query);
            return [{ text: "servicesTableJSON", value: "servicesTableJSON" }, { text: "totalVMs", value: "totalVMs" }, { text: "totalIPs", value: "totalIPs" }, { text: "totalCores", value: "totalCores" }, { text: "map_points", value: "map_points" }];
        }
    }, {
        key: 'mapToTextValue',
        value: function mapToTextValue(result) {
            return _lodash2.default.map(result.data, function (d, i) {
                if (d && d.text && d.value) {
                    return { text: d.text, value: d.value };
                } else if (_lodash2.default.isObject(d)) {
                    return { text: d, value: i };
                }
                return { text: d, value: d };
            });
        }
    }, {
        key: 'doRequest',
        value: function doRequest(options) {
            options.withCredentials = this.withCredentials;
            options.headers = this.headers;

            return this.backendSrv.datasourceRequest(options);
        }
    }, {
        key: 'buildQueryParameters',
        value: function buildQueryParameters(options) {
            var _this2 = this;

            //remove placeholder targets
            options.targets = _lodash2.default.filter(options.targets, function (target) {
                return target.target !== 'select metric';
            });

            var targets = _lodash2.default.map(options.targets, function (target) {
                return {
                    target: _this2.templateSrv.replace(target.target, options.scopedVars, 'regex'),
                    refId: target.refId,
                    hide: target.hide,
                    type: target.type || 'timeserie'
                };
            });

            options.targets = targets;

            return options;
        }
    }, {
        key: 'getTagKeys',
        value: function getTagKeys(options) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.doRequest({
                    url: _this3.url + '/tag-keys',
                    method: 'POST',
                    data: options
                }).then(function (result) {
                    return resolve(result.data);
                });
            });
        }
    }, {
        key: 'getTagValues',
        value: function getTagValues(options) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.doRequest({
                    url: _this4.url + '/tag-values',
                    method: 'POST',
                    data: options
                }).then(function (result) {
                    return resolve(result.data);
                });
            });
        }
    }]);

    return GenericDatasource;
}();
//# sourceMappingURL=datasource.js.map
