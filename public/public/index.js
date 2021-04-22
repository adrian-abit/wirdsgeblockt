let lastdomain = "";

$("#submit").on("click", () => {
	let baseURL = $("#url").val();
	let exd = extractDomain(baseURL);
	let valid = isDomainValid(exd);
	if (valid && lastdomain != exd) {
		lastdomain = exd;
		$.post("/api/test", { domain: exd }, (d) => {
			console.log(d);
			console.log(d.blocked);
			if (d.blocked == null) {
				console.log("couldn't get good result");
				$("#result").text("Es ist ein Fehler aufgetreten! Versuche es später erneut.")
			} else if (d.blocked == "notreal"){
				$("#result").html("<span style='color: #ff77ff'>" + d.domain + "</span> ist keine echte Website!")
			} else if (d.blocked) {
				$("#result").html("<span style='color: #ff77ff'>" + d.domain + "</span><span style='color: #ff0000'> wird von der CUII gesperrt!</span>")
				console.log(d.domain + " is getting blocked");
			} else if (!d.blocked) {
				$("#result").html("<span style='color: #ff77ff'>" + d.domain + "</span> wird <span style='color: #00ff00;'>nicht</span> von der CUII gesperrt!")
				console.log(d.domain + " is not getting blocked");
			}
		});
	} else {
	}
});

$("#url").on("input", () => {
	let q = $("#url").val();
	console.log(q);
	if(q == "")
		$("#headerurl").text("diese Website")
	else
		$("#headerurl").text(q);
})

function getDNS() {
	$.post("https://dnsleaktest.com/api/v1/servers-for-result", (d) => {
		console.log(d);
	});
}

function isDomainValid(domain) {
	var re = new RegExp(
		/^((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/
	);
	return domain.match(re);
}

function extractDomain(url) {
	return url.replace(
		/^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
		"$1"
	);
}
