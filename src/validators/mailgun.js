!function($) {
	'use strict';

	$.fn.proveMailgun = function(options) {

		var input = $(this);
		var value = input.vals();
		var hasValue = input.hasValue();

		var field = options.field;
		var validator = options.validator;
		var message = options.message;
		var enabled = $('body').booleanator(options.enabled);
		var debug = options.debug;
		var apikey = options.apikey;

		var dfd = $.Deferred();
		var result = {
			field: field,
			validator: validator,
			status: 'validated',
			message: message
		};

		function logInfo(additions) {

			console.groupCollapsed('Validator.proveMailgun()', field);
				console.log('options', options);
				console.log('input', input);
				console.log('value', value);
				console.log('enabled', enabled);
				console.log('apikey', apikey);
				console.log('validation', result.validation);
				$.each(additions, function(name, value) {
					console.log(name, value);
				});
			console.groupEnd();
		}

		if (!enabled) {
			result.validation = 'reset';
			if (debug) logInfo();
			dfd.resolve(result);

		} else if (!hasValue) {
			// All validators are optional except for `required` validator.
			result.validation = 'success';
			result.message = undefined;
			if (debug) logInfo();
			dfd.resolve(result);

		} else {
			$.ajax({
				type: 'GET',
				url: 'https://api.mailgun.net/v2/address/validate?callback=?',
				data: {
					address: value,
					api_key: apikey
				},
				dataType: 'jsonp',
				crossDomain: true
			})
			.done(function(data) {
				var is_valid = data.is_valid;
				var did_you_mean = data.did_you_mean;
				var suggestion;
				if (did_you_mean) suggestion = 'Did you mean ' + did_you_mean + '?';
				var confident = !suggestion;

				if (is_valid && confident) {
					result.validation = 'success';
					result.message = undefined;

				} else if (is_valid && !confident) {
					result.validation = 'warning';
					result.message = suggestion;

				} else {
					result.validation = 'danger';
					if (suggestion) result.message = suggestion;
				}

				if (debug) logInfo({data: data});
				dfd.resolve(result);
			})
			.fail(function(xhr) {
				var err = xhr.responseText;

				result.validation = 'danger';
				if (err) result.message = err;

				if (debug) logInfo({err: err});
				dfd.resolve(result);
			});
		}

		return dfd;
	};
}(window.jQuery);