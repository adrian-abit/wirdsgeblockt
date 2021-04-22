let express = require("express");
var cron = require("node-cron");
var request = require("request");
const app = express();
var exec = require("child_process").exec;

var keepaliveURL = "http://192.168.178.20:3000/api/ping";

function sendPing() {
	console.log("pinging " + keepaliveURL);
	request.post(
		keepaliveURL,
		{
			json: {
				disme:
					"98ad0a3d1f3a1456b76afdd37489303875bb045210f87fc6bde803cd02f5bad0a8096fa8-f616-479c-a9d3-c415f262b148"
			}
		},
		(err, res, bod) => {
			if (err) console.log(err);
		}
	);
}

sendPing();
setInterval(() => {
	sendPing();
}, 60 * 1000);

app.get("/api/testme", (req, res) => {
	if (req.query.url == null) {
		res.send({ notURL: "fuck u" });
		return;
	}

	console.log("got request for " + req.query.url);
	exec(
		"nslookup " + req.query.url + " 62.109.121.1 | grep Name: | head -1",
		(err, stout) => {
			console.log(stout);
			if (stout.includes("notice.cuii.info")) res.send({ blocked: true });
			else if (stout.includes(req.query.url))
				res.send({ blocked: false });
			else res.send({ blocked: "noresult" });
		}
	);
});

app.get("*", (req, res) => {
	res.redirect("https://google.com");
});

app.listen(42069);
