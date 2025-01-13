const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// MongoDB Connection
const MONGO_URI =
  "mongodb+srv://Anish:vampanish@cluster.jwc0u.mongodb.net/Cluster?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Common Match Schema
const matchSchema = new mongoose.Schema({
  sport: String, // e.g., Football or Table Tennis
  type: { type: String, enum: ["live", "upcoming"] },
  team1: String,
  team2: String,
  captain: {type:String,default:"CAPTAIN"},
  score1: { type: Number, default: 0 },
  score2: { type: Number, default: 0 },
  date: { type: String, default: null },
  time: { type: String, default: null },
  playersTeam1: { type: [String], default: [] },
  individualscoreteam1: { type: [Number], default: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  individualscoreteam2: { type: [Number], default: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  individualfoulteam1: { type: [Number], default: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  individualfoulteam2: { type: [Number], default: [0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  playersTeam2: { type: [String], default: [] },
  status1: { type: [String], default: ["Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active"] },
  status2: { type: [String], default: ["Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active","Active"] },
  goals1: { type: Number, default: 0 },
  goals2: { type: Number, default: 0 },
  yellowCards1: { type: Number, default: 0 },
  yellowCards2: { type: Number, default: 0 },
  redCards1: { type: Number, default: 0 },
  redCards2: { type: Number, default: 0 },
  cornerKicks1: { type: Number, default: 0 },
  cornerKicks2: { type: Number, default: 0 },
  freeKicks1: { type: Number, default: 0 },
  freeKicks2: { type: Number, default: 0 },
  penalties1: { type: Number, default: 0 },
  penalties2: { type: Number, default: 0 },

  // Table Tennis-Specific Fields
  set1_team1: { type: Number, default: 0 },
  set2_team1: { type: Number, default: 0 },
  set3_team1: { type: Number, default: 0 },
  set4_team1: { type: Number, default: 0 },
  set5_team1: { type: Number, default: 0 },
  set1_team2: { type: Number, default: 0 },
  set2_team2: { type: Number, default: 0 },
  set3_team2: { type: Number, default: 0 },
  set4_team2: { type: Number, default: 0 },
  set5_team2: { type: Number, default: 0 },

  // New Fields
  quarter: { type: Number, default: 1 }, // 1 for first quarter, 2 for second, etc.
  half: { type: Number, default: 1 }, // 1 for first half, 2 for second half

  // Jersey numbers for both teams (12 players)
 

  // Match status (e.g., "active", "paused", "completed")
  status: { type: String, default: "active" },

  matchEvents: { type: String, default: "" },
});

const Match = mongoose.model("Match", matchSchema);

// Routes

// Get all matches
app.get("/api/matches", async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Error fetching matches" });
  }
});

// Get live matches
app.get("/api/matches/live-matches", async (req, res) => {
  try {
    const liveMatches = await Match.find({ type: "live" });
    res.json(liveMatches);
  } catch (error) {
    res.status(500).json({ error: "Error fetching live matches" });
  }
});

// Get upcoming matches
app.get("/api/matches/upcoming-matches", async (req, res) => {
  try {
    const upcomingMatches = await Match.find({ type: "upcoming" });
    res.json(upcomingMatches);
  } catch (error) {
    res.status(500).json({ error: "Error fetching upcoming matches" });
  }
});

// Get match by ObjectId
app.get("/api/matches/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    const match = await Match.findById(id);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ error: "Error fetching match details" });
  }
});

// Add a match (Football or Table Tennis)
app.post("/api/matches", async (req, res) => {
  try {
    const {
      sport,
      type,
      team1,
      team2,
      date,
      time,
      playersTeam1,
      playersTeam2,
      ...specificFields
    } = req.body;

    // Combine common match data and sport-specific data
    const matchData = {
      sport,
      type,
      team1,
      team2,
      date: type === "upcoming" ? date : null,
      time: type === "upcoming" ? time : null,
      playersTeam1: playersTeam1 || [],
      playersTeam2: playersTeam2 || [],
      ...specificFields, // Additional fields for Football/Table Tennis
    };

    // Save match to the common Match collection
    const match = new Match(matchData);
    const savedMatch = await match.save();

    res.status(201).json(savedMatch);
  } catch (error) {
    console.error("Error saving match:", error);
    res.status(500).json({ error: "Error saving match" });
  }
});

// Delete a match
app.delete("/api/matches/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    const deletedMatch = await Match.findByIdAndDelete(id);

    if (!deletedMatch) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json({ message: "Match deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting match" });
  }
});

// Update a match by ObjectId
app.put("/api/matches/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid match ID" });
    }

    // Update match with the entire request body without validating individual fields
    const updatedMatch = await Match.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedMatch) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ error: "Error updating match" });
  }
});


// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
