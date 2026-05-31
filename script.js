// Wedding events. Times below are in UTC (IST = UTC + 5:30).
// Reception: 23-06-2026, 6:00 PM IST -> 10:00 PM IST  (4 hours)
// Muhurtham: 24-06-2026, 9:15 AM IST -> 10:45 AM IST
const VENUE = "Mangala Kalyana Mandapa, Koramangala, Bangaluru - 560095";
const MAP_URL = "https://maps.app.goo.gl/oRni7gdmUDAxoGq3A";

const events = {
  reception: {
    title: "Kousalya–Thananjay Reception",
    description:
      "Reception ceremony of Kousalya & Thananjay Sriram. Venue: " +
      VENUE + ". Map: " + MAP_URL,
    location: VENUE,
    start: "20260623T123000Z",
    end: "20260623T163000Z",
    url: MAP_URL,
  },
  muhurtham: {
    title: "Kousalya–Thananjay Muhurtham",
    description:
      "Wedding muhurtham of Kousalya & Thananjay Sriram. Venue: " +
      VENUE + ". Map: " + MAP_URL,
    location: VENUE,
    start: "20260624T034500Z",
    end: "20260624T051500Z",
    url: MAP_URL,
  },
};

function icsEscape(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function nowStampUtc() {
  return new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function buildIcs(evt) {
  const uid =
    evt.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
    "-" + evt.start + "@kousalya-thananjay";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kousalya Thananjay Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:" + uid,
    "DTSTAMP:" + nowStampUtc(),
    "DTSTART:" + evt.start,
    "DTEND:" + evt.end,
    "SUMMARY:" + icsEscape(evt.title),
    "DESCRIPTION:" + icsEscape(evt.description),
    "LOCATION:" + icsEscape(evt.location),
    "URL:" + evt.url,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT12H",
    "ACTION:DISPLAY",
    "DESCRIPTION:" + icsEscape(evt.title) + " starts in 12 hours",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

// Google Calendar template URL — opens directly in the installed Google
// Calendar app on Android (via App Links) or Google Calendar web on
// desktop. No download is triggered.
function buildGoogleCalendarUrl(evt) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: evt.title,
    dates: evt.start + "/" + evt.end,
    details: evt.description + "\n\n(Reminder set: 12 hours before)",
    location: evt.location,
  });
  return (
    "https://calendar.google.com/calendar/render?" + params.toString()
  );
}

// Route to the device's native calendar handler:
//   - iOS  -> .ics data URI (opens Apple Calendar directly with VALARM).
//   - Android / Desktop -> Google Calendar template URL (opens Google
//     Calendar app via Android App Links, or web on desktop). Does not
//     trigger a file download.
function openCalendar(evt) {
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (ua.includes("Mac") && navigator.maxTouchPoints > 1);

  if (isIOS) {
    const ics = buildIcs(evt);
    const dataUri =
      "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    window.location.href = dataUri;
    return;
  }

  const gcalUrl = buildGoogleCalendarUrl(evt);
  const w = window.open(gcalUrl, "_blank", "noopener,noreferrer");
  if (!w) {
    window.location.href = gcalUrl;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".event[data-event-key]");
  cards.forEach(function (el) {
    const key = el.getAttribute("data-event-key");
    const evt = events[key];
    if (!evt) return;

    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute(
      "aria-label",
      "Add " + evt.title + " to your calendar"
    );
    el.setAttribute("title", "Tap to add this event to your calendar");

    el.addEventListener("click", function () {
      openCalendar(evt);
    });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCalendar(evt);
      }
    });
  });
});
