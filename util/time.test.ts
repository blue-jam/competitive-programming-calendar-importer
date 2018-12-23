import {calculateDurationFromString} from "./time";

test('Calculate duration in second from HH:mm', () => {
    expect(calculateDurationFromString('01:23'))
        .toEqual(4980);
});
