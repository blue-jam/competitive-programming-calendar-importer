import Calendar = GoogleAppsScript.Calendar.Calendar;
import {getElementsByClassName, getElementsByTagName, parseHtml} from "./util/htmlParser";
import {calculateDurationFromString} from "./util/time";

interface IContest {
    title: string;
    url: string;
    startTime: Date;
    endTime: Date;
}

const fetchAtcoderContests = () => {
    const response = UrlFetchApp.fetch("https://atcoder.jp/contests/?lang=en");
    const document = parseHtml(response);
    const root = document.getRootElement();
    const contestTable = getElementsByClassName(root, "table")[1];
    const tbody = getElementsByTagName(contestTable, "tbody")[0];
    const rows = getElementsByTagName(tbody, "tr");

    const contests: IContest[] = [];
    for (const row of rows) {
        const columns = getElementsByTagName(row, "td");

        const dateString = columns[0].getValue().trim()
            .replace(/\//g, "-")
            .replace(" ", "T");
        const date = new Date(dateString);

        const url = columns[1].getChild("a").getAttribute("href").getValue();
        const title = columns[1].getChild("a").getText();

        const duration = calculateDurationFromString(columns[2].getValue());

        contests.push({
            title,
            url,
            startTime: date,
            endTime: new Date(date.getTime() + duration * 1000),
        });
    }
    return contests;
};

const fetchCodeforcesContests = () => {
    const response = UrlFetchApp.fetch("http://codeforces.com/api/contest.list?gym=false&lang=en");
    const contests = JSON.parse(response.getContentText()).result;
    return contests
        .filter((contest) => contest.phase !== "FINISHED")
        .map((contest) => {
            return {
                title: contest.name,
                url: contest.descriprion,
                startTime: new Date(contest.startTimeSeconds * 1000),
                endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000),
            };
        });
};

const checkDuplication = (title: string, startTime: Date, dstCalendar: Calendar) => {
    const eventList = dstCalendar.getEventsForDay(startTime);
    for (const event of eventList) {
        if (event.getTitle() === title) {
            return event;
        }
    }
    return undefined;
};

const addContest = (contest: IContest, dstCalendar: Calendar) => {
    const { title, startTime, endTime, url } = contest;
    const res = checkDuplication(title, startTime, dstCalendar);
    if (typeof contest.url === "undefined") {
        contest.url = "";
    }
    if (typeof res === "undefined") {
        dstCalendar.createEvent(title, startTime, endTime, { description: url, location: url });
    } else {
        res.setTime(startTime, endTime);
        res.setLocation(url);
        res.setDescription(url);
    }
};

function updateCalendar() {
    // Read calendar ids from Properties
    const scriptProperties = PropertiesService.getScriptProperties();

    const dstCalendarId = scriptProperties.getProperty("dstCalendarId");
    const dstCalendar = CalendarApp.getCalendarById(dstCalendarId);

    const codeforcesContest = fetchCodeforcesContests();
    const atcoderContests = fetchAtcoderContests();
    const contests = [...codeforcesContest, ...atcoderContests];
    contests.forEach((e) => addContest(e, dstCalendar));
}
