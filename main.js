import dayjs from "dayjs"

function prettySummary(summary) {
        return `
    ================================
            MONTHLY BILL
    ================================
    Customer: ${summary.Customer}
    Minimum fee: $${summary.MinimumFee}

    Calls detail:
    - Local calls:         $${summary.LocalCalls}
    - National calls:      $${summary.NationalCalls}
    - International calls: $${summary.InternationalCalls}

    --------------------------------
    TOTAL:                $${summary.Total}
    ================================
    `.trim();
}

class MonthlyBill {
    #customerName;
    #minimumFee;
    #calls;

    constructor(holder, minFee, calls){
        this.#customerName = holder;
        this.#minimumFee = minFee;
        this.#calls = calls;
    }

    getCustomerName() {
        return this.#customerName;
    }

    getMinimumFee(){
        return this.#minimumFee;
    }

    getTotalOfAllCalls(){
        return this.#calls
        .reduce((total, call) => total + call.cost(), 0);
    }

    getTotalByType(type) {
        return this.#calls
        .filter(call =>  call instanceof type)
        .reduce((total, call) => total + call.cost(), 0).toFixed(2);
    }

    getTotal() {
        return (this.#minimumFee + this.getTotalOfAllCalls()).toFixed(2);
    }

    getSummary(){
        return {
            Customer: this.#customerName,
            MinimumFee: this.#minimumFee,
            LocalCalls: this.getTotalByType(LocalCall),
            NationalCalls: this.getTotalByType(NationalCall),
            InternationalCalls: this.getTotalByType(InternationalCall),
            Total: this.getTotal()
        }
    }

}


class PhoneLine {
    #holder;
    #minimumFee;
    #calls;

    constructor(name, minFee) {
        this.#holder = name
        this.#minimumFee = minFee
        this.#calls = [] 
    }

    #getCallsFromLastMonth() {
        let now = dayjs();
        let oneMonthAgo = now.subtract(1, "month")

        return this.#calls.filter(call => call.wasMadeAfter(oneMonthAgo) && call.wasMadeBefore(now))
    }

    getMonthlyBill(){
        return new MonthlyBill(
            this.#holder,
            this.#minimumFee,
            this.#getCallsFromLastMonth()
        );
    }

    registerCall(call) {
        this.#calls.push(call)
    }
}


class Call {
    #durationInMinutes
    #timeOfTheCall

    constructor(duration, timeOfTheCall) {
        this.#durationInMinutes = duration
        this.#timeOfTheCall = timeOfTheCall
    }

    getDurationOfTheCall() {
        return this.#durationInMinutes
    }

    getTimeOfTheCall(){
        return this.#timeOfTheCall
    }

    wasMadeAfter(date){
        return dayjs(this.#timeOfTheCall).isAfter(date)
    }

    wasMadeBefore(date) {
        return dayjs(this.#timeOfTheCall).isBefore(date)
    }

    cost(){
        throw Error("cost implementation has to be in subclasses")
    }
}

class LocalCall extends Call {
    #lower_rate = 0.10;
    #higher_rate = 0.20;

    cost(){
        const durationInMinutes = this.getDurationOfTheCall();
        const timeOfTheCall = dayjs(this.getTimeOfTheCall());

        const endOfTheCall =  timeOfTheCall.add(durationInMinutes, "minute");

        const minutesWithHigherRate = this.#minutesHigherRate(timeOfTheCall, endOfTheCall);
        const minutesWithLowerRate = durationInMinutes - minutesWithHigherRate; 
        
        return (minutesWithHigherRate * this.#higher_rate) + (minutesWithLowerRate * this.#lower_rate);
    }

    #minutesHigherRate(startCall, endCall) {
        const daysToCheck = [startCall.startOf("day")];

        if (!startCall.isSame(endCall, "day")) {
            daysToCheck.push(endCall.startOf("day"));
        }

        let total = 0;

        for (const dayStart of daysToCheck) {
            const day = dayStart.day();


            if (!(1 <= day && day <= 5)){
                continue
            }

            const eightOClock = dayStart
                .hour(8)
                .minute(0)
                .second(0)
                .millisecond(0)
            const twentyOClock = dayStart
                .hour(20)
                .minute(0)
                .second(0)
                .millisecond(0)

            const starOverlap = startCall.isAfter(eightOClock) ? startCall : eightOClock
            const endOverlap = endCall.isBefore(twentyOClock) ? endCall : twentyOClock
            
            total += endOverlap.isAfter(starOverlap) ?  endOverlap.diff(starOverlap, "minute") : 0
        }

        return total
    }
}

class NationalCall  extends Call {
    #locationRate

    constructor(duration, timeOfTheCall, locationCallRate){
        super(duration, timeOfTheCall)
        this.#locationRate = locationCallRate
    }

    cost() {
        return this.getDurationOfTheCall() * this.#locationRate
    }
}

class InternationalCall extends Call {
    #locationRate

    constructor(duration, timeOfTheCall, locationCallRate){
        super(duration, timeOfTheCall)
        this.#locationRate = locationCallRate
    }

    cost() {
        return this.getDurationOfTheCall() * this.#locationRate
    }
}
  
export {
    PhoneLine,
    MonthlyBill,
    Call,
    LocalCall,
    NationalCall,
    InternationalCall
}


const calls0 = [
      new LocalCall(60, "2026-05-18T09:00:00"),               // 60 * 0.20 = 12
      new NationalCall(20, "2026-05-18T10:00:00", 0.50),      // 20 * 0.50 = 10
      new InternationalCall(15, "2026-05-18T10:00:00", 2.00), // 15 * 2.00 = 30
    ];

const example = new PhoneLine("Pedro", 60) 
example.registerCall(calls0[0])
example.registerCall(calls0[1])
example.registerCall(calls0[2])

const bill0 = example.getMonthlyBill()

console.log(prettySummary(bill0.getSummary()))


const line = new PhoneLine("Pedro", 100);
line.registerCall(new LocalCall(60,"2026-05-15T09:15:00"))
line.registerCall(new NationalCall(34, "2026-05-10T14:40:00", 1.0))
line.registerCall(new InternationalCall(14, "2026-04-30T21:05:00", 3.2))

const bill1 = line.getMonthlyBill()

console.log(prettySummary(bill1.getSummary()))