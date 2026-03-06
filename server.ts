import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("justevibes.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    bio TEXT,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT, -- 'text', 'image', 'video', 'music'
    content TEXT,
    media_url TEXT,
    music_title TEXT,
    music_artist TEXT,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    media_url TEXT,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    receiver_id TEXT,
    content TEXT,
    type TEXT DEFAULT 'text',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS music_trends (
    id TEXT PRIMARY KEY,
    title TEXT,
    artist TEXT,
    genre TEXT,
    cover_url TEXT,
    audio_url TEXT
  );
`);

// Seed some initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (id, username, email, bio, avatar) VALUES (?, ?, ?, ?, ?)");
  insertUser.run("user1", "VibeMaster", "vibe@example.com", "Living for the music 🎵", "https://picsum.photos/seed/user1/200");
  insertUser.run("user2", "AmapianoQueen", "queen@example.com", "Amapiano to the world! 🇿🇦", "https://picsum.photos/seed/user2/200");
  
  const insertMusic = db.prepare("INSERT INTO music_trends (id, title, artist, genre, cover_url, audio_url) VALUES (?, ?, ?, ?, ?, ?)");
  insertMusic.run("m1", "Mnike", "Tyler ICU", "Amapiano", "https://picsum.photos/seed/mnike/300", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
  insertMusic.run("m2", "City Boys", "Burna Boy", "Afrobeats", "https://picsum.photos/seed/burna/300", "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3");
  
  const insertPost = db.prepare("INSERT INTO posts (id, user_id, type, content, media_url) VALUES (?, ?, ?, ?, ?)");
  insertPost.run("p1", "user1", "image", "Check out this vibe!", "https://picsum.photos/seed/post1/600/800");
  insertPost.run("p2", "user2", "text", "Amapiano is life! Who's with me?", null);
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer);
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/posts", (req, res) => {
    const posts = db.prepare(`
      SELECT posts.*, users.username, users.avatar 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY created_at DESC
    `).all();
    res.json(posts);
  });

  app.get("/api/music/trends", (req, res) => {
    const trends = db.prepare("SELECT * FROM music_trends").all();
    res.json(trends);
  });

  app.get("/api/messages/:userId/:otherId", (req, res) => {
    const { userId, otherId } = req.params;
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(userId, otherId, otherId, userId);
    res.json(messages);
  });

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    res.json(user);
  });

  app.post("/api/posts", (req, res) => {
    const { user_id, type, content, media_url, music_title, music_artist } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO posts (id, user_id, type, content, media_url, music_title, music_artist) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, user_id, type, content, media_url, music_title, music_artist);
    res.json({ success: true, id });
  });

  // Socket.io for real-time chat
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("send_message", (data) => {
      const { sender_id, receiver_id, content, type } = data;
      const id = Math.random().toString(36).substr(2, 9);
      db.prepare("INSERT INTO messages (id, sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?, ?)")
        .run(id, sender_id, receiver_id, content, type);
      
      io.to(receiver_id).emit("receive_message", { ...data, id, created_at: new Date().toISOString() });
      socket.emit("message_sent", { ...data, id, created_at: new Date().toISOString() });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
