import { describe, it, expect } from "vitest";
import dayjs from "dayjs";

import{
    PhoneLine,
    MonthlyBill,
    Call,
    LocalCall,
    NationalCall,
    InternationalCall
} from "./main.js";

const TESTINGDATE = 


describe("LocalCall", () => {
  it("charges higher rate when the call is fully between Monday-Friday 08:00 and 20:00 - LocalCall", () => {
    const call = new LocalCall(60, "2026-05-18T09:00:00"); // Monday

    expect(call.cost()).toBeCloseTo(12); // 60 * 0.20
  });

  it("charges lower rate when the call is fully outside 08:00-20:00 - LocalCall", () => {
    const call = new LocalCall(30, "2026-05-18T21:00:00"); // Monday

    expect(call.cost()).toBeCloseTo(3); // 30 * 0.10
  });

  it("splits the cost when the call starts before 08:00 and ends after 08:00 - LocalCall", () => {
    const call = new LocalCall(60, "2026-05-18T07:30:00"); // Monday

    // 30 min lower: 30 * 0.10 = 3
    // 30 min higher: 30 * 0.20 = 6
    expect(call.cost()).toBeCloseTo(9);
  });

  it("splits the cost when the call starts before 20:00 and ends after 20:00 - LocalCall", () => {
    const call = new LocalCall(60, "2026-05-18T19:30:00"); // Monday

    // 30 min higher: 30 * 0.20 = 6
    // 30 min lower: 30 * 0.10 = 3
    expect(call.cost()).toBeCloseTo(9);
  });

  it("handles a call that starts before 08:00 and ends after 20:00 - LocalCall", () => {
    const call = new LocalCall(840, "2026-05-18T07:00:00"); // Monday 07:00 -> 21:00

    // 07:00 - 08:00 => 60 min lower = 6
    // 08:00 - 20:00 => 720 min higher = 144
    // 20:00 - 21:00 => 60 min lower = 6
    expect(call.cost()).toBeCloseTo(156);
  });

  it("handles a call that starts on Sunday and ends on Monday after 08:00 - LocalCall", () => {
    const call = new LocalCall(540, "2026-05-17T23:30:00"); 
    // Sunday 23:30 -> Monday 08:30

    // 23:30 - 08:00 => 510 min lower = 51
    // 08:00 - 08:30 => 30 min higher = 6
    expect(call.cost()).toBeCloseTo(57);
  });

  it("handles a call that starts on Friday before 20:00 and ends on Saturday - LocalCall", () => {
    const call = new LocalCall(300, "2026-05-22T19:30:00");
    // Friday 19:30 -> Saturday 00:30

    // 19:30 - 20:00 => 30 min higher = 6
    // 20:00 - 00:30 => 270 min lower = 27
    expect(call.cost()).toBeCloseTo(33);
  });

  it("charges lower rate during weekends - LocalCall", () => {
    const call = new LocalCall(120, "2026-05-17T10:00:00"); // Sunday

    expect(call.cost()).toBeCloseTo(12); // 120 * 0.10
  });
});

describe("NationalCall/InternationalCall",  () =>{
  it("charges duration multiplied by the location rate - NationalCall", () => {
    const call = new NationalCall(20, "2026-05-18T10:00:00", 0.50); - LocalCall

    expect(call.cost()).toBeCloseTo(10);
  });

  it("charges duration multiplied by the location rate - InternationalCall", () => {
    const call = new NationalCall(20, "2026-05-18T10:00:00", 2.00);

    expect(call.cost()).toBeCloseTo(40);
  });
});


describe("PhoneLine", () => {
    it("registers calls and returns monthly bill", () =>{
      const line = new PhoneLine("Pedro", 100);

      line.registerCall(new LocalCall(60,"2026-05-15T09:15:00"))
      line.registerCall(new NationalCall(34, "2026-05-10T14:40:00", 1.0))
      line.registerCall(new InternationalCall(14, "2026-04-30T21:05:00", 3.2))

      const bill = line.getMonthlyBill()

      expect(bill.getCustomerName()).toBe("Pedro");
      expect(bill.getMinimumFee()).toBe(100);
      expect(Number(bill.getTotalByType(LocalCall))).toBeCloseTo(12);
      expect(Number(bill.getTotalByType(NationalCall))).toBeCloseTo(34);
      expect(Number(bill.getTotalByType(InternationalCall))).toBeCloseTo(44.8);
      expect(Number(bill.getTotal())).toBeCloseTo(190.8);
    });
});


describe("MonthlyBill", () =>{
  it("calculates the total amount including the minimum fee and all calls", () => {
    const calls = [
      new LocalCall(60, "2026-05-18T09:00:00"),          // 12
      new NationalCall(20, "2026-05-18T10:00:00", 0.50), // 10
      new InternationalCall(15, "2026-05-18T10:00:00", 2.00), // 30
    ];

    const bill = new MonthlyBill("Pedro", 100, calls);

    expect(Number(bill.getTotalOfAllCalls())).toBeCloseTo(52);
    expect(Number(bill.getTotal())).toBeCloseTo(152);
  });

  it("returns a valid summary when there are no calls", () => {
    const bill = new MonthlyBill("Pedro", 100.0, []);

    expect(bill.getSummary()).toEqual({
      Customer: "Pedro",
      MinimumFee: 100,
      LocalCalls: "0.00",
      NationalCalls: "0.00",
      InternationalCalls: "0.00",
      Total: "100.00",
    });
  });

  it("returns a complete summary with totals by call type", () => {
    const line = new PhoneLine("Pedro", 100);

    line.registerCall(new LocalCall(60, "2026-05-18T09:00:00"));          
    line.registerCall(new NationalCall(20, "2026-05-18T10:00:00", 0.85));
    line.registerCall(new InternationalCall(120, "2026-04-12T10:00:00", 2.00));

    const bill = line.getMonthlyBill()

    expect(bill.getSummary()).toEqual({
      Customer: "Pedro",
      MinimumFee: 100,
      LocalCalls: "12.00",
      NationalCalls: "17.00",
      InternationalCalls: "0.00",
      Total: "129.00",
    });
  });

});