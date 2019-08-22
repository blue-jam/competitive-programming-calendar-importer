import {calculateDurationFromString, calculateEndDate, parseDateString} from "./atcoder";

test("Parse a string indicates a start time of an AtCoder contest", () => {
    expect(parseDateString("2018-12-29(Sat) 21:00+09:00"))
        .toEqual(new Date(1546084800000));
});

test("Calculate duration in second from HH:mm", () => {
    expect(calculateDurationFromString("01:23"))
        .toEqual(4980);
});

test("Calculate an end time of a contest from a start time and a duration", () => {
    expect(calculateEndDate(new Date('2018-12-29T21:00+09:00'), 4980))
        .toEqual(new Date("2018-12-29T22:23+09:00"));
});
