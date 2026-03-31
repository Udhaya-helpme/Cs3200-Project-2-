const express = require("express");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const URI = "mongodb://127.0.0.1:27017";
const client = new MongoClient(URI);

let users, applications;

async function start() {
  await client.connect();
  const db = client.db("internship_tracker");
  users = db.collection("users");
  applications = db.collection("applications");
  app.listen(3000, () => console.log("API running on http://localhost:3000"));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/users", async (req, res) => {
  const rows = await users.find({}, { projection: { name: 1 } }).toArray();
  res.json(rows);
});

app.get("/api/applications", async (req, res) => {
  const rows = await applications.find({}).toArray();
  res.json(rows);
});

app.get("/api/applications/:id", async (req, res) => {
  const row = await applications.findOne({ _id: new ObjectId(req.params.id) });
  if (!row) return res.status(404).json({ error: "Application not found" });
  res.json(row);
});

app.post("/api/applications", async (req, res) => {
  const { user_id, applied_date, current_status, notes, company, job_posting } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id is required" });
  const doc = {
    user_id,
    applied_date: applied_date ?? new Date().toISOString(),
    current_status: current_status ?? "Applied",
    is_active: true,
    notes: notes ?? "",
    company: company ?? {},
    job_posting: job_posting ?? {},
    status_history: [{ status: current_status ?? "Applied", changed_at: new Date().toISOString(), notes: "" }],
    interviews: [],
    offer: null,
    contacts: [],
    tags: []
  };
  const result = await applications.insertOne(doc);
  res.status(201).json({ _id: result.insertedId });
});

app.put("/api/applications/:id", async (req, res) => {
  const { current_status, notes, is_active } = req.body;
  const result = await applications.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { current_status, notes, is_active } }
  );
  if (result.matchedCount === 0) return res.status(404).json({ error: "Application not found" });
  res.json({ updated: result.modifiedCount });
});

app.delete("/api/applications/:id", async (req, res) => {
  const result = await applications.deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) return res.status(404).json({ error: "Application not found" });
  res.json({ deleted: result.deletedCount });
});

app.get("/api/interviews", async (req, res) => {
  const docs = await applications.find({ "interviews.0": { $exists: true } }).toArray();
  const interviews = docs.flatMap(a =>
    a.interviews.map(i => ({ ...i, app_id: a._id, company: a.company.name, job_title: a.job_posting.title }))
  );
  res.json(interviews);
});

app.post("/api/interviews", async (req, res) => {
  const { app_id, round, type, scheduled_date, outcome, notes } = req.body;
  if (!app_id) return res.status(400).json({ error: "app_id is required" });
  const interview = {
    _id: new ObjectId(),
    round: round ?? 1,
    type: type ?? "Technical",
    scheduled_date: scheduled_date ?? null,
    outcome: outcome ?? "Pending",
    notes: notes ?? ""
  };
  const result = await applications.updateOne(
    { _id: new ObjectId(app_id) },
    { $push: { interviews: interview } }
  );
  if (result.matchedCount === 0) return res.status(404).json({ error: "Application not found" });
  res.status(201).json({ _id: interview._id });
});

app.put("/api/interviews/:id", async (req, res) => {
  const { outcome, notes } = req.body;
  const result = await applications.updateOne(
    { "interviews._id": new ObjectId(req.params.id) },
    { $set: { "interviews.$.outcome": outcome, "interviews.$.notes": notes } }
  );
  if (result.matchedCount === 0) return res.status(404).json({ error: "Interview not found" });
  res.json({ updated: result.modifiedCount });
});

app.delete("/api/interviews/:id", async (req, res) => {
  const result = await applications.updateOne(
    { "interviews._id": new ObjectId(req.params.id) },
    { $pull: { interviews: { _id: new ObjectId(req.params.id) } } }
  );
  if (result.matchedCount === 0) return res.status(404).json({ error: "Interview not found" });
  res.json({ deleted: result.modifiedCount });
});

start();
