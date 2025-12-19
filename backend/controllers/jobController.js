// backend/controllers/jobController.js

import db from "../config/db.js";

/**
 * CREATE JOB
 * Recruiter only
 */
export const createJob = (req, res) => {
  console.log("REQ.USER:", req.user);
  const { title, description } = req.body;
  const companyId = req.user.company_id;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  const query =
    "INSERT INTO jobs (title, description, status, company_id) VALUES (?, ?, 'open', ?)";

  db.query(query, [title, description, companyId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }

    res.status(201).json({
      message: "Job created successfully",
      jobId: result.insertId,
    });
  });
};

/**
 * GET JOBS (company-wise)
 * Recruiter only
 */
export const getJobs = (req, res) => {
  const companyId = req.user.company_id;

  db.query(
    "SELECT * FROM jobs WHERE company_id = ?",
    [companyId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
      }

      res.json(results);
    }
  );
};

/**
 * UPDATE JOB
 * Recruiter only
 */
export const updateJob = (req, res) => {
  console.log("REQ.USER:", req.user);
  const { jobId } = req.params;
  const { title, description, status } = req.body;
  const companyId = req.user.company_id;

  const query = `
    UPDATE jobs
    SET title = ?, description = ?, status = ?
    WHERE id = ? AND company_id = ?
  `;

  db.query(
    query,
    [title, description, status, jobId, companyId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({ message: "Job updated successfully" });
    }
  );
};

/**
 * DELETE JOB
 * Recruiter only
 */
export const deleteJob = (req, res) => {
  console.log("REQ.USER:", req.user);
  const { jobId } = req.params;
  const companyId = req.user.company_id;

  db.query(
    "DELETE FROM jobs WHERE id = ? AND company_id = ?",
    [jobId, companyId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({ message: "Job deleted successfully" });
    }
  );
};
