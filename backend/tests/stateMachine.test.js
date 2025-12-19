import { expect } from "chai";
import ApplicationStateService from "../services/applicationStateService.js";

describe("ApplicationStateService", () => {

  it("should allow valid transitions", () => {
    expect(ApplicationStateService.isValidTransition("applied", "screening")).to.be.true;
    expect(ApplicationStateService.isValidTransition("screening", "interview")).to.be.true;
    expect(ApplicationStateService.isValidTransition("interview", "offer")).to.be.true;
    expect(ApplicationStateService.isValidTransition("offer", "hired")).to.be.true;
    
    // Any state → rejected is valid
    expect(ApplicationStateService.isValidTransition("applied", "rejected")).to.be.true;
    expect(ApplicationStateService.isValidTransition("screening", "rejected")).to.be.true;
    expect(ApplicationStateService.isValidTransition("interview", "rejected")).to.be.true;
    expect(ApplicationStateService.isValidTransition("offer", "rejected")).to.be.true;
  });

  it("should block other invalid transitions", () => {
    expect(ApplicationStateService.isValidTransition("applied", "offer")).to.be.false;
    expect(ApplicationStateService.isValidTransition("hired", "applied")).to.be.false;
    expect(ApplicationStateService.isValidTransition("screening", "hired")).to.be.false;
  });

});
