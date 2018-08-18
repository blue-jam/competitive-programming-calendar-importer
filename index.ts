import Calendar = GoogleAppsScript.Calendar.Calendar;

const getElementsByClassName = (element, classToFind: string) => {
    const data = [];
    const descendants = element.getDescendants();
    descendants.push(element);
    for(const i in descendants) {
        const elt = descendants[i].asElement();
        if(elt != null) {
            let classes = elt.getAttribute('class');
            if(classes !== null) {
                classes = classes.getValue();
                if(classes === classToFind) data.push(elt);
                else {
                    classes = classes.split(' ');
                    for(const j in classes) {
                        if(classes[j] === classToFind) {
                            data.push(elt);
                            break;
                        }
                    }
                }
            }
        }
    }
    return data;
};

const getElementsByTagName = (element, tagName: string) => {
    const data = [];
    const descendants = element.getDescendants();
    for(const i in descendants) {
        const elt = descendants[i].asElement();
        if(elt !== null && elt.getName() === tagName) data.push(elt);
    }
    return data;
};

interface Contest {
    title: string,
    url: string,
    startTime: Date,
    endTime: Date,
}

const fetchAtcoderContests = () => {
    const response = UrlFetchApp.fetch('http://atcoder.jp/contest?lang=ja');
    const document = XmlService.parse(Xml.parse(response.getContentText(), true).html.body.toXmlString());
    const root = document.getRootElement();
    const contestTable = getElementsByClassName(root, 'table')[1];
    const tbody = getElementsByTagName(contestTable, 'tbody')[0];
    const rows = getElementsByTagName(tbody, 'tr');

    const contests = [];
    for (let i = 0; i < rows.length; i += 3) {
        const columns = getElementsByTagName(rows[i], 'td');

        const dateString = columns[0].getValue().trim()
            .replace(/\//g, '-')
            .replace(' ', 'T');
        const date = new Date(`${dateString}:00+0900`);

        const url = columns[1].getChild('a').getAttribute('href').getValue();
        const title = columns[1].getChild('a').getText();

        const [durationHour, durationMinute] = columns[2].getValue()
            .split(':')
            .map(s => parseInt(s, 10));
        const duration = durationHour * 3600 + durationMinute * 60;

        contests.push({
            title,
            url,
            startTime: date,
            endTime: new Date(date.getTime() + duration * 1000)
        });
    }
    return contests;
};

const fetchCodeforcesContests = () => {
    const response = UrlFetchApp.fetch("http://codeforces.com/api/contest.list?gym=false&lang=en");
    const contests = JSON.parse(response.getContentText()).result;
    return contests
        .filter((contest) => contest.phase !== 'FINISHED')
        .map((contest) => {
            return {
                title: contest.name,
                url: contest.descriprion,
                startTime: new Date(contest.startTimeSeconds * 1000),
                endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000)
            };
        });
};

const checkDuplication = (title: string, startTime: Date, dstCalendar: Calendar) => {
    const events = dstCalendar.getEventsForDay(startTime);
    for (let i = 0; i < events.length; i++) {
        if (events[i].getTitle() === title) {
            return events[i];
        }
    }
    return undefined;
};

const addContest = (contest: Contest, dstCalendar: Calendar) => {
    const { title, startTime, endTime, url } = contest;
    const res = checkDuplication(title, startTime, dstCalendar);
    if (typeof contest.url === "undefined")
        contest.url = "";
    if (typeof res === 'undefined') {
        dstCalendar.createEvent(title, startTime, endTime,
            { description: url, location: url });
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
