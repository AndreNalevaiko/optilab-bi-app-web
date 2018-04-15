/**
 * Created by andre on 19/09/17.
 */
angular.module('gorillascode.services.helper-jsonapi', [])
    .service('JsonApiHelper', [
        function () {

            function dict_relationship(include, data) {
                var resource = {};
                resource = {};
                resource['data'] = data;
                angular.forEach(resource['data'], function (dt) {
                    dt['type'] = include;
                });
                return resource;
            }

            this.toRequestJsonApi = function (data, resourceName, includes) {
                includes = typeof includes !== 'undefined' ? includes : null;
                var resource = {};
                resource['data'] = {};
                resource['data']['id'] = angular.copy(data.id);
                resource['id'] = angular.copy(data.id);
                resource['data']['type'] = resourceName;
                resource['data']['attributes'] = angular.copy(data);
                resource['data']['relationships'] = {};
                if (includes != null) {
                    angular.forEach(includes, function (include) {
                        var relation = dict_relationship(include, resource['data']['attributes'][include]);
                        resource['data']['relationships'][include] = dict_relationship(include, resource['data']['attributes'][include]);
                    });
                }
                return resource;
            };

            function structure_object(data) {
                objects = [];
                if (data.constructor != Array) {
                    obj = {};
                    obj['id'] = data.id;
                    obj['type'] = data.type;
                    angular.forEach(data.attributes, function (value, key) {
                        obj[key] = value;
                    });
                    return obj;
                }
                angular.forEach(data, function (dt) {
                    obj = {};
                    obj['id'] = dt.id;
                    obj['relationships'] = dt.relationships;
                    angular.forEach(dt.attributes, function (value, key) {
                        obj[key] = value;
                    });
                    objects.push(obj);
                });
                return objects;
            }

            this.fromObject = function (response) {
                response = angular.fromJson(response);
                if (!response.links) {
                    return response;
                }
                var primary_data = null;
                try {
                    primary_data = structure_object(angular.copy(response.data));
                }catch (e){
                    return response;
                }
                var included_dicts = {};
                if (!response.included) {
                    return primary_data;
                }
                angular.forEach(response.included, function (data) {
                    try {
                        included_dicts[data.type].push(structure_object(data));
                    } catch (e) {
                        included_dicts[data.type] = [structure_object(data)];
                    }
                });
                if (primary_data.constructor != Array) {
                    angular.forEach(response.included, function (data) {
                        primary_data[data.type] = included_dicts[data.type];
                    });
                    return primary_data;
                }
                angular.forEach(primary_data, function (primary) {
                    angular.forEach(primary.relationships, function (pr) {
                        if (pr.data == null) {
                            return;
                        }
                        else if (pr.data.constructor === Array) {
                            angular.forEach(pr.data, function (data_relations) {
                                angular.forEach(included_dicts, function (types) {
                                    angular.forEach(types, function (data) {
                                        if (data.type == data_relations.type & data.id == data_relations.id) {
                                            try {
                                                primary[data.type].push(data);
                                            } catch (e) {
                                                primary[data.type] = [data];
                                            }
                                        }
                                    });
                                });
                            });
                        } else {
                            angular.forEach(pr, function (data_relations) {
                                angular.forEach(included_dicts, function (types) {
                                    angular.forEach(types, function (data) {
                                        if (data.type == data_relations.type & data.id == data_relations.id) {
                                            try {
                                                primary[data.type].push(data);
                                            } catch (e) {
                                                primary[data.type] = [data];
                                            }
                                        }
                                    });
                                });
                            });
                        }
                    });
                });

                return {
                    result: primary_data,
                    limit: 0
                };

            };
        }

    ]);