if (!window.R) {
	alert('There is an error talking to the Rdio API!');
	return;
}

R.ready(function() {
	$('#rdioIcon').html('<img width="50px" height="50px" src="' + R.currentUser.get('icon') + '" />');
	displayField('#rdioName', R.currentUser.get('firstName') + ' ' + R.currentUser.get('lastName'));

	R.request({
		method: 'getHeavyRotation',
		content: {
			type: 'albums',
			count: 16
		},
		success: function(response) {
			var popular = $('#popular');
			
			popular.hide();
			for (var r in response.result) {
				var album = response.result[r];
				popular.after('<a href="#" onClick="alert(\'' + album.key + '\');"><img width="50px" height="50px" src="' + album.icon + '" /></a>');
				//alert(JSON.stringify(response.result[r]));

			}
			popular.fadeIn('slow');
		},
		error: function(response) {
			alert('There was an error retrieving popular albums!');
		}
	});
});

var displayField = function(id, value) {
	var f = $(id);
	f.hide();
	f.text(value);
	f.fadeIn('slow');
}