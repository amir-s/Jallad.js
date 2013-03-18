
module.exports = new function () {
	this.type_check = function (schema, variable) {
		if (typeof(variable) === "undefined") {
			if (typeof(schema.optional) === "undefined" || schema.optional === false) {
				return {check: "optional", val: false};
			}
			// variable is missing and it is optional
			return {check: "optional", val: true};
		}
		if (schema.type === "array") {
			return {check: "type", val: typeof(variable) === "object" && variable instanceof Array};
		}
		if (schema.type === "integer") {
			if (typeof(variable) !== "number" || variable != parseInt(variable)) return {check: "type", val: false};
			return {check: "type", val: true};
		}
		return {check: "type", val: typeof(variable) === schema.type};
	}
	this.check_properties = function (schema, variable, errors, path) {
		if (schema.minimum) {
			if (variable < schema.minimum) errors.push({property: path, message: "Value must be at least "+schema.minimum});
		}
		if (schema.maximum) {
			if (variable > schema.maximum) errors.push({property: path, message: "Value must not exeed "+schema.maximum});
		}
		if (schema.minimum_length) {
			if (variable.length < schema.minimum_length) errors.push({property: path, message: "Length must be at least "+schema.minimum_length});
		}
		if (schema.maximum_length) {
			if (variable.length > schema.maximum_length) errors.push({property: path, message: "Length must not exeed "+schema.maximum_length});
		}
	}
	this.rec_check = function (schema, variable, errors, path) {
		var type_check_result = this.type_check(schema, variable);
		if (!type_check_result.val) {
			if (type_check_result.check === "type") {
				errors.push({
					property: path,
					message: "type mismatch: expeted:" + schema.type + ", saw:" + typeof(variable)
				});
			}else if (type_check_result.check == "optional") {
				errors.push({
					property: path,
					message: "missing required properties!"
				});
			}
			return;
		}
		if (type_check_result.val === true && type_check_result.check === "optional") return;
		this.check_properties(schema, variable, errors, path);
		if (schema.check && schema.check instanceof Array) {
			for (var filter in schema.check) {
				var result = schema.check[filter].call(null, variable);
				if (result.pass_if === false) {
					errors.push({
						property: path,
						message: result.message
					});
				}
			}
		}
		if (schema.type === "object") {
			for (var prop in schema.properties) {
				this.rec_check(schema.properties[prop], variable[prop], errors, path+"."+prop);
			}
		}else if(schema.type === "array") {
			for (var i=0;i<variable.length;i++) {
				this.rec_check(schema.items, variable[i], errors, path+"["+i+"]");
			}
		}
	}
	this.check = function (schema, variable) {
		var errors = [];
		this.rec_check(schema, variable, errors, "test_obj");
		return {valid: errors.length === 0, errors: errors};
	}
}