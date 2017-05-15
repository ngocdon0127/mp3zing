var regex = /mp3\.zing\.vn/;

// if website is mp3 zing, send url to background
if (regex.test(window.location.hostname) === true){
	chrome.runtime.sendMessage({
		actionType: "send-window-location-to-bg",
		data: window.location
	}, function (response) {
		console.log(response);
		if (response.status === 'OK'){
			var links = response.links;
			var div = document.createElement('div');
			$(div).attr('id', 'mp3zingdownloaddiv');
			$(div).css("display", "none");
			for (var i = 0; i < links.length; i++) {
				var a = document.createElement('a');
				$(a).attr('href', links[i]["link_download"][128]);
				$(a).addClass('mp3downloadclass');
				$(a).text(links[i].title + " - " + links[i].artist);
				$(a).appendTo($(div));
			};
			$(div).appendTo($('body'));
			var atags = document.getElementsByClassName('mp3downloadclass');
			var noOfTags = atags.length;
			
		}
	});
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.actionType === "download"){
		$('.mp3downloadclass').each(function (index) {
			setTimeout(function () {
				console.log("start downloading " + $(this).text());
				$(this)[0].click();
			}.bind(this), index * 1500);
		});
	}
})

if (window.location.href == 'https://online.vpbank.com.vn/cb/pages/jsp-ns/login-cons.jsp'){
	var flag = false;
	var interval = setInterval(function () {
		if (!flag){
			try {
				// document.getElementById('password').setAttribute('size', 50)
				var passField = document.getElementById('password')
				if (passField){
					passField.setAttribute('maxlength', 50)
					flag = true;
					clearInterval(interval)
				}
			}
			catch (e){
				console.log(e);
			}
		}
	}, 10)
}
