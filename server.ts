import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(express.json());

// In-memory store for bookings
// Key: seatId (e.g., "A-1"), Value: { name: string, timestamp: number }
let bookings: Record<string, { name: string; timestamp: number }> = {};

// Broadcast to all clients
function broadcast(data: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// API Routes
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

app.post("/api/book", (req, res) => {
  const { seats, name } = req.body;
  if (!seats || !Array.isArray(seats) || !name) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const timestamp = Date.now();
  const successfulSeats: string[] = [];
  const failedSeats: string[] = [];

  // Check if any seat is already booked
  for (const seatId of seats) {
    if (bookings[seatId]) {
      failedSeats.push(seatId);
    } else {
      successfulSeats.push(seatId);
    }
  }

  if (failedSeats.length > 0) {
    return res.status(409).json({ error: "Vui lòng chọn ghế khác", failedSeats });
  }

  // Book all seats
  for (const seatId of seats) {
    bookings[seatId] = { name, timestamp };
  }

  broadcast({ type: "UPDATE", bookings });
  res.json({ success: true, bookedSeats: successfulSeats });
});

app.post("/api/admin/clear", (req, res) => {
  const { password } = req.body;
  if (password === "130613") {
    bookings = {};
    broadcast({ type: "UPDATE", bookings });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/api/admin/delete", (req, res) => {
  const { password, seatId } = req.body;
  if (password === "130613") {
    delete bookings[seatId];
    broadcast({ type: "UPDATE", bookings });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
