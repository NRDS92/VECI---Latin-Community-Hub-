import { businessBehaviorRateLimit } from "./business-behavior-rate-limit.middleware";
import { BusinessBehaviorRateLimit } from "../modules/business/business-behavior-rate-limit.model";

jest.mock("../modules/business/business-behavior-rate-limit.model", () => ({
  BusinessBehaviorRateLimit: { findOneAndUpdate: jest.fn() },
}));

describe("business behavior request rate limit", () => {
  it("limits anonymous bursts without retaining the raw network identity", () => {
    const req: any = {
      ip: "198.51.100.24",
      socket: { remoteAddress: "198.51.100.24" },
      get: () => "anonymous-test-agent",
    };
    const next = jest.fn();
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res: any = { status, json };
    let call = 0;
    (BusinessBehaviorRateLimit.findOneAndUpdate as jest.Mock).mockImplementation(() => {
      call += 1;
      if (call === 61) return Promise.reject({ code: 11000 });
      if (call === 62) return Promise.resolve(null);
      return Promise.resolve({ count: 1 });
    });

    const requests = Array.from({ length: 61 }, () => businessBehaviorRateLimit(req, res, next));

    return Promise.all(requests).then(() => {
      expect(next).toHaveBeenCalledTimes(60);
      expect(status).toHaveBeenCalledWith(429);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: "RATE_LIMITED" }));
      const [filter, update] = (BusinessBehaviorRateLimit.findOneAndUpdate as jest.Mock).mock.calls[0];
      expect(filter.count).toEqual({ $lt: 60 });
      expect(filter.identityKey).not.toContain(req.ip);
      expect(JSON.stringify(update)).not.toContain(req.ip);
    });
  });
});
