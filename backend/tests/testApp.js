import express from "express";
import applicationRoutes from "../routes/applicationRoutes.js";

const app = express();
app.use(express.json());
app.use("/applications", applicationRoutes);

export default app; // Export this for Supertest
