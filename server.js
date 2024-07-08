require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

app.get("/api/hello", async (req, res) => {
	const visitorName = req.query.visitor_name || "Visitor";

	let clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

	if (clientIp && clientIp.includes(",")) {
		clientIp = clientIp.split(",")[0];
	}
	console.log(`Detected client IP from headers: ${clientIp}`);

	if (!clientIp || clientIp === "::1" || clientIp === "127.0.0.1") {
		try {
			const ipifyResponse = await axios.get(
				"https://api64.ipify.org?format=json"
			);
			clientIp = ipifyResponse.data.ip;
			console.log(`Fallback IP from ipify: ${clientIp}`);
		} catch (ipifyError) {
			console.error("Failed to fetch IP from ipify:", ipifyError.message);
			return res
				.status(500)
				.json({ error: "Failed to determine client IP" });
		}
	}

	try {
		const locationResponse = await axios.get(
			`http://ip-api.com/json/${clientIp}`
		);
		console.log("Location response:", locationResponse.data);

		if (locationResponse.data.status === "fail") {
			return res
				.status(500)
				.json({ error: "Failed to fetch location data" });
		}

		const { city, lat, lon } = locationResponse.data;
		const apiKey = process.env.API_KEY;

		const weatherResponse = await axios.get(
			"https://api.openweathermap.org/data/2.5/weather",
			{
				params: {
					lat,
					lon,
					appid: apiKey,
					units: "metric",
				},
			}
		);

		const temperature = weatherResponse.data.main.temp;
		const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`;

		res.json({
			client_ip: clientIp,
			location: city,
			greeting: greeting,
		});
	} catch (error) {
		console.error("An error occurred:", error.message);
		res.status(500).json({
			error: "Unable to fetch data",
		});
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
