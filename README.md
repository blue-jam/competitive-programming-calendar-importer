# competitive-programming-calendar-importer
Google Apps Script to add competitive programming contest schedules to Google Calendar.

You can just subscribe [a Google Calendar created by the script](https://calendar.google.com/calendar/embed?src=69bg7jido1j1t51tcrsjmquv28%40group.calendar.google.com&ctz=Asia%2FTokyo).

## Usage

Prerequirements:

* You have a Google account.
* You have developing tools listed the below on your machine.
  * [git](https://git-scm.com)
  * [Node.js](https://nodejs.org/)
  * [clasp](https://developers.google.com/apps-script/guides/clasp)

Make sure you have logged in clasp with your Google account.

1. Run `clasp create` and create [a Standalone Scripts project](https://developers.google.com/apps-script/guides/standalone).
1. Run `clasp push`. You may have to overwrite a manifest file.
1. Create a Google Calendar and a Google Doc.
1. On the Project page of your Standalone Script project, Open "File" > "Project properties" > "Script properties
  and add script properties.

   | Property | Value |
   | - | - |
   | dstCalendarId | (ID of your Google Calendar) |
   | eventDbDocId  | (ID of your Google Doc) |

1. On the Project page, select `index.gs` and run `updateCalendar`.
  You may have to give the script permissions for Calendar and Doc.
1. (Optional) Add [a time-driven trigger](https://developers.google.com/apps-script/guides/triggers) to run the script periodically.
  4 times per day or fewer is probably enough.
