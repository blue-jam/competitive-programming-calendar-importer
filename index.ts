import Calendar = GoogleAppsScript.Calendar.Calendar;
import {fetchAtcoderContests} from "./contestsite/atcoder";
import {IContest} from "./model/contest";

const fetchCodeforcesContests = () => {
    const response = UrlFetchApp.fetch("http://codeforces.com/api/contest.list?gym=false&lang=en");
    const contests = JSON.parse(response.getContentText()).result;
    return contests
        .filter((contest) => contest.phase !== "FINISHED")
        .map((contest) => {
            return {
                contestId: "codeforces-" + contest.id,
                title: contest.name,
                url: contest.descriprion,
                startTime: new Date(contest.startTimeSeconds * 1000),
                endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000),
            };
        });
};

const checkDuplication = (contest: IContest, dstCalendar: Calendar, eventDb: IEventDb) => {
    const entry = eventDb[contest.contestId];
    if (typeof entry !== "undefined") {
        return dstCalendar.getEventById(entry.eventId);
    }

    const eventList = dstCalendar.getEventsForDay(contest.startTime);
    for (const event of eventList) {
        if (event.getTitle() === contest.title) {
            return event;
        }
    }
    return undefined;
};

const addContest = (contest: IContest, dstCalendar: Calendar, eventDb: IEventDb) => {
    const { title, startTime, endTime } = contest;
    let { url } = contest;
    const res = checkDuplication(contest, dstCalendar, eventDb);
    if (typeof url === "undefined") {
        url = "";
    }
    if (typeof res === "undefined") {
        const event = dstCalendar.createEvent(title, startTime, endTime, { description: url, location: url });
        eventDb[contest.contestId] = { contestId: contest.contestId, eventId: event.getId() };
    } else {
        if (res.getTitle() !== contest.title) {
            res.setTitle(contest.title);
        }
        if (res.getStartTime() !== startTime || res.getEndTime() !== endTime) {
            res.setTime(startTime, endTime);
        }
        if (res.getLocation() !== url) {
            res.setLocation(url);
        }
        if (res.getDescription() !== url) {
            res.setDescription(url);
        }
        eventDb[contest.contestId] = { contestId: contest.contestId, eventId: res.getId() };
    }
};

const filterOutFinishedEventsFromDb = (eventDb: IEventDb, calendar: Calendar) => {
    const currentTimeMillis = Date.now();

    const futureOrOngoingContestIds = Object.keys(eventDb).filter((contestId) => {
        const endTime = calendar.getEventById(eventDb[contestId].eventId).getEndTime();

        return endTime.getTime() > currentTimeMillis;
    });

    const newEventDb = {};
    futureOrOngoingContestIds.forEach((contestId) => newEventDb[contestId] = eventDb[contestId]);

    return newEventDb;
};

function updateCalendar() {
    // Read calendar ids from Properties
    const scriptProperties = PropertiesService.getScriptProperties();

    const dstCalendarId = scriptProperties.getProperty("dstCalendarId");
    const dstCalendar = CalendarApp.getCalendarById(dstCalendarId);

    const eventDbDocId = scriptProperties.getProperty("eventDbDocId");
    const eventDbDoc = DocumentApp.openById(eventDbDocId);

    let eventDb: IEventDb;
    try {
        eventDb = JSON.parse(eventDbDoc.getBody().getText());
    } catch (e) {
        eventDb = {};
    }

    const codeforcesContest = fetchCodeforcesContests();
    const atcoderContests = fetchAtcoderContests();
    const contests = [...codeforcesContest, ...atcoderContests];
    contests.forEach((e) => addContest(e, dstCalendar, eventDb));

    const newEventDb = filterOutFinishedEventsFromDb(eventDb, dstCalendar);

    eventDbDoc.getBody().setText(JSON.stringify(newEventDb));
}
