let express = require("express");
var exphbs = require("express-handlebars");
var path = require("path");
var bodyParser = require("body-parser");
var request = require("request");

const app = express();

let keepaliveID =
	"98ad0a3d1f3a1456b76afdd37489303875bb045210f87fc6bde803cd02f5bad0a8096fa8-f616-479c-a9d3-c415f262b148";

let internIP = "";

let lastping = Date.now();

app.engine(
	"hbs",
	exphbs({
		extname: "hbs",
		layoutsDir: "./views/pages/",
		partialsDir: "./views/partials/"
	})
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "/views"));

app.post("/api/test", (req, res) => {
	let domain = req.body.domain;

	domain = extractDomain(domain);
	if (!isDomainValid(domain)) {
		res.send({ domain: req.body.domain, blocked: null });
		return;
	}
	console.log("got");
	if (internIP != "") {
		request.get(
			"http://" + internIP + ":42069/api/testme?url=" + domain,
			(err, _, bod) => {
				if (err) {
					console.log(err);
					res.send({ domain: req.body.domain, blocked: null });
				} else {
					result = JSON.parse(bod);
					console.log(result);
					if (result["blocked"] == true)
						res.send({ domain: req.body.domain, blocked: true });
					else if (result["blocked"] == false)
						res.send({ domain: req.body.domain, blocked: false });
					else
						res.send({
							domain: req.body.domain,
							blocked: "notreal"
						});
				}
			}
		);
	} else res.send({ domain: req.body.domain, blocked: null });
});

app.get("/", (_, res) => {
	if (Date.now() - lastping > 120000)
		res.send(
			"<style>*{background-color: #202124; color: #fff; font-family: Arial, Helvetica, sans-serif;}</style><h1>Es scheint so, als ob es gerade ein paar Probleme gibt. Bitte versuch es später erneut!</h1> <h3>wirdsgeblockt.de</h3><a>last sign of life / waiting for sign of life for " +
				(Date.now() - lastping) / 1000 +
				"s now</a>"
		);
	else if (internIP == "")
		res.send(
			"<style>*{background-color: #202124; color: #fff; font-family: Arial, Helvetica, sans-serif;}</style><h1>Die Systeme fahren gerade hoch, bitte versuche es in einer Minute erneut</h1> <h3>wirdsgeblockt.de</h3> <a>waiting for sign of life for " +
				(Date.now() - lastping) / 1000 +
				"s now</a>"
		);
	else res.render("index", { sol: (Date.now() - lastping) / 1000 });
});

app.post("/api/ping", (req, res) => {
	if (req.body.disme != keepaliveID) res.redirect("https://google.com");
	else {
		internIP =
			req.headers["x-forwarded-for"] || req.connection.remoteAddress;

		if (internIP.startsWith("::ffff:"))
			internIP = internIP.split("::ffff:")[1];
		lastping = Date.now();
		console.log("intern told me its ip is: " + internIP);
		res.send("thx");
	}
});

app.listen(3000);

function isDomainValid(domain) {
	var re = new RegExp(/^((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/);
	return domain.match(re);
}

function extractDomain(url) {
	return url.replace(
		/^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
		"$1"
	);
}
