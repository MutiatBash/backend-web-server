require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

app.get("/api/hello", async (req, res) => {
	const visitorName = req.query.visitor_name || "Visitor";

	try {
		const ipifyResponse = await axios.get(
			"https://api64.ipify.org?format=json"
		);
		const clientIp = ipifyResponse.data.ip;

		const locationResponse = await axios.get(
			`http://ip-api.com/json/${clientIp}`
		);
		console.log("Location response:", locationResponse.data);

		if (locationResponse.data.status === "fail") {
			console.error("Failed to fetch location data");
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
