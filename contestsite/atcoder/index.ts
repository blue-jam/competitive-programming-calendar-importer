import {getElementsByClassName, getElementsByTagName, parseHtml} from "../../util/htmlParser";
import {IContest} from "../../model/contest";
import {calculateDurationFromString, calculateEndDate, parseDateString} from "./atcoder";

const ATCODER_BASE_URL = "https://atcoder.jp";

export function fetchAtcoderContests() {
    const response = UrlFetchApp.fetch(`${ATCODER_BASE_URL}/contests/?lang=en`);
    const document = parseHtml(response);
    const root = document.getRootElement();
    const contestTable = getElementsByClassName(root, "table")[1];
    const tbody = getElementsByTagName(contestTable, "tbody")[0];
    const rows = getElementsByTagName(tbody, "tr");

    const contests: IContest[] = [];
    for (const row of rows) {
        const columns = getElementsByTagName(row, "td");
        const date = parseDateString(columns[0].getValue());
        const path = columns[1].getChild("a").getAttribute("href").getValue();
        const title = columns[1].getChild("a").getText();
        const duration = calculateDurationFromString(columns[2].getValue());

        contests.push({
            contestId: "atcoder-" + path,
            title,
            url: ATCODER_BASE_URL + path,
            startTime: date,
            endTime: calculateEndDate(date, duration),
        });
    }
    return contests;
}
