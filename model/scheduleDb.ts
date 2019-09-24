interface IEventEntry {
    contestId: string;
    eventId: string;
}

interface IEventDb {
    [key: string]: IEventEntry;
}
