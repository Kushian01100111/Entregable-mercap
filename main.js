import dayjs from "dayjs"

// Aux functions
function mod(a) {
    if (a < 0) {
        return -a
    }
    return a
}

//


class PhoneLine {
    #user;
    #minFee
    #localCalls;
    #nationalCalls;
    #internationalCalls; 

    constructor(name, minFee) {
        this.#user = name
        this.#minFee = minFee
        this.#localCalls = 0
        this.#nationalCalls = 0
        this.#internationalCalls = 0 
    }

    monthlyBilling(){

    }

    makeLocalCall(durationInMinutes, timeOfTheCall){
        if (typeof durationInMinutes !== "number" || !(timeOfTheCall instanceof Date)) {
            return console.log("Incorrect types given for this operation");
        }
        const day = timeOfTheCall.getDay(); 
        const time = dayjs(timeOfTheCall)
        let endOfTheCall = dayjs(timeOfTheCall)
        endOfTheCall = endOfTheCall.add(durationInMinutes, "minute")

        const eightOClock = time
            .hour(8)
            .minute(0)
            .second(0)
            .millisecond(0)
        const tweetyOClock = time
            .hour(20)
            .minute(0)
            .second(0)
            .millisecond(0)

        const range = {eight: eightOClock, twenty: tweetyOClock}


        this.#localCalls += this.#correctRate(day, durationInMinutes, time, endOfTheCall, range)
    }

    makeNationalCall(durationInMinutes, locationCallRate){
        this.#nationalCalls += durationInMinutes * locationCallRate;
    }

    makeInternationalCall(durationInMinutes, locationCallRate){
        this.#internationalCalls += durationInMinutes * locationCallRate;
    }

    getBalance() {
        const balance = (this.#minFee + this.#localCalls + this.#nationalCalls + this.#internationalCalls).toFixed(2)
        console.log(this.#localCalls.toFixed(2))
    }

    #correctRate(day, durationInMinutes, timeOfTheCall, endOfTheCall, range) {
        const LOWER_RATE = 0.10
        const HIGHER_RATE = 0.20

        const starsBefore = timeOfTheCall.isBefore(range.eight);
        const finishesBefore = endOfTheCall.isBefore(range.eight);
        const starsAfter = timeOfTheCall.isAfter(range.twenty);
        const finishesAfter = endOfTheCall.isAfter(range.twenty);


        let minutesWithLowerRate = 0 ;
        let minutesWithHigherRate = 0 ;
        let diff ; 
        if (0 <= day && day <= 4) { // Monday-friday
            if (starsBefore && finishesBefore || starsAfter && finishesAfter) {// in the 20-8 range
                return durationInMinutes * LOWER_RATE
            } else if (!starsBefore && !finishesAfter){ // in the 8-20 range
                return durationInMinutes * HIGHER_RATE
            }else if (starsBefore && !finishesBefore) { // starts before 8 and finishes before 20
                diff = timeOfTheCall.diff(range.eight, "minute", true);
                minutesWithLowerRate = durationInMinutes >= diff ? diff : durationInMinutes;
                minutesWithHigherRate = durationInMinutes >= diff ? (durationInMinutes - diff) : 0 ;

                return (minutesWithLowerRate * LOWER_RATE) + (minutesWithHigherRate * HIGHER_RATE);
            }else if (!starsAfter && finishesAfter) { // starts before 20 and finishes after
                minutesWithLowerRate = endOfTheCall.diff(range.twenty, "minute", true)
                minutesWithHigherRate = mod(minutesWithLowerRate - durationInMinutes)
                
                return (minutesWithLowerRate * LOWER_RATE) + (minutesWithHigherRate * HIGHER_RATE)
            }else if (starsBefore && finishesAfter){// starts before 8 and finishes after 20
                minutesWithLowerRate = timeOfTheCall.diff(range.eight, "minute", true) + endOfTheCall(range.twenty, "minute", true)
                minutesWithHigherRate = durationInMinutes - minutesWithLowerRate

                return (minutesWithLowerRate * LOWER_RATE) + (minutesWithHigherRate * HIGHER_RATE)
            }
        }else if (5 <= day  && day <= 6){ //Saturday-Sunday
            return 0 
        }
    }   



}

  
const User1 = new PhoneLine("Pedro", 130.5);
let time = new Date();
//User1.makeLocalCall(15, time)
//User1.makeLocalCall(25, time)
User1.makeLocalCall(65, time)


User1.getBalance()