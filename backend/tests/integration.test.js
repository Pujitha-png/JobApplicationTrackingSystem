import request from "supertest";
import { expect } from "chai";
import sinon from "sinon";
import jwt from "jsonwebtoken";
import app from "./testApp.js"; // test app
import emailQueue from "../queue/emailQueue.js";

describe("Application API Integration", () => {

  let tokenRecruiter;
  let tokenCandidate;
  let sandbox;

  before(() => {
    // ✅ Generate REAL JWT tokens
    tokenRecruiter = "Bearer " + jwt.sign(
      { id: 2, role: "recruiter" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    tokenCandidate = "Bearer " + jwt.sign(
      { id: 3, role: "candidate" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Stub email queue
    sandbox = sinon.createSandbox();
    sandbox.stub(emailQueue, "add").resolves("email queued");
  });

  after(() => {
    sandbox.restore();
  });

  it("should allow recruiter to change stage and record history", async () => {
    const res = await request(app)
      .put("/applications/1/stage")
      .set("Authorization", tokenRecruiter)
      .send({ newStage: "screening" });

    expect(res.status).to.equal(200);
    expect(res.body.message).to.include("Stage changed");

    const historyRes = await request(app)
      .get("/applications/1/history")
      .set("Authorization", tokenRecruiter);

    expect(historyRes.status).to.equal(200);
    expect(historyRes.body.history).to.be.an("array");
    expect(historyRes.body.history[0]).to.have.property("previous_stage");
    expect(historyRes.body.history[0]).to.have.property("new_stage");
  });

  it("should block candidate from changing stage", async () => {
    const res = await request(app)
      .put("/applications/1/stage")
      .set("Authorization", tokenCandidate)
      .send({ newStage: "interview" });

    expect(res.status).to.equal(403);
  });

});
