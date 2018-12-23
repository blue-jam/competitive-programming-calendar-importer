import {getElementsByClassName, getElementsByTagName, parseHtml} from "../../util/htmlParser";
import {IContest} from "../../model/contest";
import {calculateDurationFromString} from "../../util/time";

export function fetchAtcoderContests() {
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
}
