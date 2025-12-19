import { expect } from "chai";
import sinon from "sinon";
import authorizeRoles from "../middleware/authorizeRoles.js";

describe("RBAC Middleware", () => {

  it("should allow authorized role", () => {
    const req = { user: { role: "candidate" } };
    const res = {};
    const next = sinon.spy(); // spy to see if next() is called

    const middleware = authorizeRoles("candidate");
    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
  });

  it("should block unauthorized role", () => {
    const req = { user: { role: "recruiter" } };
    const res = { 
      status: sinon.stub().returnsThis(), 
      json: sinon.spy() 
    };
    const next = sinon.spy();

    const middleware = authorizeRoles("candidate");
    middleware(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });

  it("should allow one of multiple roles", () => {
    const req = { user: { role: "hiring_manager" } };
    const res = {};
    const next = sinon.spy();

    const middleware = authorizeRoles("candidate", "hiring_manager");
    middleware(req, res, next);

    expect(next.calledOnce).to.be.true;
  });

});
