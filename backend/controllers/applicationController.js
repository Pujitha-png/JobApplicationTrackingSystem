import db from "../config/db.js";
import ApplicationStateService from "../services/applicationStateService.js";
import emailQueue from "../queue/emailQueue.js";

// -----------------------------
// Candidate: apply to job
// -----------------------------
export const applyToJob = async (req, res) => {
  const { jobId } = req.body;
  const candidateId = req.user.userId;

  try {
    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO applications (job_id, candidate_id, stage) VALUES (?, ?, 'applied')",
        [jobId, candidateId],
        (err, result) => (err ? reject(err) : resolve(result))
      );
    });
    res.json({ message: "Applied to job successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to apply to job" });
  }
};

// -----------------------------
// Candidate: view own applications
// -----------------------------
export const viewOwnApplications = async (req, res) => {
  const candidateId = req.user.userId;

  try {
    const applications = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM applications WHERE candidate_id = ?",
        [candidateId],
        (err, results) => (err ? reject(err) : resolve(results))
      );
    });
    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

// -----------------------------
// Recruiter: view all applications for jobs
// -----------------------------
export const viewAllApplicationsForJobs = async (req, res) => {
  // Since there is no recruiter_id, we just return all applications for now
  try {
    const applications = await new Promise((resolve, reject) => {
      db.query(
        `SELECT a.*, j.title AS job_title
         FROM applications a
         JOIN jobs j ON a.job_id = j.id`,
        [],
        (err, results) => (err ? reject(err) : resolve(results))
      );
    });
    res.json({ applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications for jobs" });
  }
};

// -----------------------------
// Single application: candidate, recruiter, or hiring manager
// -----------------------------
export const viewApplication = async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const rows = await new Promise((resolve, reject) => {
      db.query(
        `SELECT a.* FROM applications a WHERE a.id = ?`,
        [applicationId],
        (err, results) => (err ? reject(err) : resolve(results))
      );
    });

    if (!rows || rows.length === 0) return res.status(404).json({ message: "Application not found" });

    const app = rows[0];

    // RBAC check
    if (userRole === "candidate" && app.candidate_id !== userId)
      return res.status(403).json({ message: "Access denied" });

    res.json({ application: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};

// -----------------------------
// Recruiter: change stage
// -----------------------------
export const changeStage = async (req, res) => {
  const { applicationId } = req.params;
  const { newStage } = req.body;

  try {
    // Get current application stage
    const rows = await new Promise((resolve, reject) => {
      db.query(
        "SELECT stage FROM applications WHERE id = ?",
        [applicationId],
        (err, results) => (err ? reject(err) : resolve(results))
      );
    });

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    const currentStage = rows[0].stage;

    // Validate stage transition
    if (!ApplicationStateService.canTransition(currentStage, newStage)) {
      return res.status(400).json({ message: "Invalid stage transition" });
    }

    // Update stage
    await new Promise((resolve, reject) => {
      db.query(
        "UPDATE applications SET stage = ? WHERE id = ?",
        [newStage, applicationId],
        (err) => (err ? reject(err) : resolve())
      );
    });

    // Insert history
    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO application_history (application_id, previous_stage, new_stage) VALUES (?, ?, ?)",
        [applicationId, currentStage, newStage],
        (err) => (err ? reject(err) : resolve())
      );
    });

    // Async email
    await emailQueue.add({ applicationId, newStage });

    return res.json({ message: "Stage changed successfully", newStage });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to change stage" });
  }
};

// -----------------------------
// Application history
// -----------------------------
export const getApplicationHistory = async (req, res) => {
  const { applicationId } = req.params;

  try {
    const history = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM application_history WHERE application_id = ? ORDER BY changed_at ASC",
        [applicationId],
        (err, results) => (err ? reject(err) : resolve(results))
      );
    });

    res.json({ history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get application history" });
  }
};
