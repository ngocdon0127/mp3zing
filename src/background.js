chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.actionType){
		case 'send-window-location-to-bg':
			var data = request.data;
			console.log(data);
			var songRegex = /bai-hat.*\/([a-zA-Z0-9]+)\.html$/;
			var playlistRegex = /album.*\/([a-zA-Z0-9]+)\.html$/;

			// single song
			if (songRegex.test(data.pathname) === true){
				var result = songRegex.exec(data.pathname);
				var songId = result[1];
				getSongDownloadLink(songId, function (data) {
					var response = {};
					if (data.hasOwnProperty("link_download")){
						if (Object.keys(data.link_download).length > 0){
							response.status = 'OK';
							var song = {};
							song.title = data.title;
							song.artist = data.artist;
							song.link_download = data.link_download;
							response.links = [song];
							sendResponse(response);
						}
					}
				})
			}

			// album
			else if (playlistRegex.test(data.pathname) === true){
				console.log('playlist');
				var intervalGetLinkSongs = null;
				var links = [];
				function encryptID (id) {
					var a = a = "GHmn|LZk|DFbv|BVd|ASlz|QWp|ghXC|Nas|Jcx|ERui|Tty".split("|");
					return [1,0,8,0,10].concat((id-307843200+'').split(''),[10,1,2,8,10,2,0,1,0]).map(
						function (i) {
							return a[i][Math.random()*a[i].length|0];
						}
					).join('')
				}

				function convertToInt(id) {
					var a = '0IWOUZ6789ABCDEF'.split(''); 
					var b = '0123456789ABCDEF'; 
					return parseInt(id.split('').map(function(v){return b[a.indexOf(v)]}).join(''), 16)
				}

				var result = playlistRegex.exec(data.pathname);
				var playlistId = result[1];
				var encryptedId = encryptID(convertToInt(playlistId));
				console.log(encryptedId);
				$.ajax({
					url: "http://m.mp3.zing.vn/xml/album/" + encryptedId,
					type: 'GET',
					success: function (data) {
						data = JSON.parse(data).data;
						var noOfSongs = data.length;
						intervalGetLinkSongs = setInterval(function () {
							if (links.length >= noOfSongs){
								clearInterval(intervalGetLinkSongs);
								// send data to content-scripts
								var response = {};
								response.status = 'OK';
								response.links = links;
								sendResponse(response);
							}
						}, 1000);
						for (var i = 0; i < data.length; i++) {
							getSongDownloadLink(data[i].id, function (data) {
								if (data.hasOwnProperty("link_download")){
									if (Object.keys(data.link_download).length > 0){
										var song = {};
										song.title = data.title;
										song.artist = data.artist;
										song.link_download = data.link_download;
										links.push(song);
									}
								}
							})
						};
					},
					error: function (err) {
						console.log(err);
					}
				});
			}
			break;
	};
	return true;
});

/**
 * Get direct link to download a song
 *
 * @param {String} id ID of song
 * @param {function} cb callback function
 */
function getSongDownloadLink (id, fn) {
	var apiURL = "http://api.mp3.zing.vn/api/mobile/song/getsonginfo";
	var ajaxData = {
		keycode: "fafd463e2131914934b73310aa34a23f",
		requestdata: JSON.stringify({id: id})
	}
	$.ajax({
		url: apiURL,
		type: 'GET',
		data: ajaxData,
		success: function (data) {
			fn(data);
		},
		error: function (err) {
			console.log(err);
			fn(err);
		}
	})
}

chrome.browserAction.onClicked.addListener(function (tab) {
	chrome.tabs.sendMessage(
		tab.id, 
		{
			actionType: "download"
		},
		function (response) {
			
		}
	);
})