const path = require("path");
require('dotenv').config({path: path.resolve(__dirname+'/.env')});

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


const PORT = process.env.PORT || 3000;
const API_URL =
  `https://api.metals.dev/v1/latest?api_key=JFXO1U4MX5ENH7ATLR9D337ATLR9D&currency=USD&unit=toz`;

async function fetchMetalsData() {
  import("node-fetch")
    .then(async (node_fetch) => {
      const response = await node_fetch.default(API_URL, { method: "GET" });
      const data = await response.json();
      io.emit("metalsData", data.metals);
      return data.metals;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      throw error;
    });
}

io.on("connection", (socket) => {
  console.log("Client connected");
  fetchMetalsData();

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

setInterval(fetchMetalsData, 10000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
