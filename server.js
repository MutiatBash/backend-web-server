require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 3000;

// Route to handle /api/hello endpoint
app.get("/api/hello", async (req, res) => {
	const visitorName = req.query.visitor_name || "Visitor";

	try {
		// Fetch client's IP address and location data using ipinfo.io
		const ipinfoResponse = await axios.get("https://ipinfo.io/json", {
			headers: {
				Authorization: `Bearer ${process.env.IP_TOKEN}`,
			},
		});
		const { ip, city, loc } = ipinfoResponse.data;

		// Extract latitude and longitude from location data
		const [lat, lon] = loc.split(",");

		// Fetch weather data using latitude and longitude
		const apiKey = process.env.OPENWEATHERMAP_API_KEY;
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

		// Extract temperature from weather data
		const temperature = weatherResponse.data.main.temp;
		const greeting = `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`;

		// Send JSON response with client IP, location, and greeting
		res.json({
			client_ip: ip,
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

// Start the server on specified port
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
