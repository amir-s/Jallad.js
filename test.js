var jallad = require("./jallad.js");
function under(str) {
	return {pass_if: str !== "username", message: "This cant be \"username\""};
}
function aft(str) {
	return {pass_if: str.indexOf(".") === -1, message: "This cant include a dot"};
}
function odd(num) {
	return {pass_if: num%2 == 1, message: "This should be odd number"};
}
var options = {
	type: "object",
	properties: {
		tests: {
			type: "array",
			minimum_length: 1,
			items: {
				type: "object",
				properties: {
					username: {
						type: "string",
						minimum_length: 4,
						check: [under, aft]
					},
					id: {
						type: "integer",
						minimum: 10,
						check: [odd]
					},
					name: {
						type: "string",
						optional: true,
						maximum_length: 5,
						minimum_length: 5
					}
				}
			}
		}
	}
}

var a = {
	tests: [
		{
			username: "amir",
			id: 32
		},
		{
			username: "usernamse",
			id: 41,
			name: "dsdss"
		}
	]
};

console.log(jallad.check(options, a));
