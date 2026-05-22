// Wedding events. Times below are in UTC (IST = UTC + 5:30).
// Reception: 23-06-2026, 6:00 PM IST -> 10:00 PM IST  (4 hours)
// Muhurtham: 24-06-2026, 6:00 AM IST -> 7:30 AM IST
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
    start: "20260624T003000Z",
    end: "20260624T020000Z",
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

// Open the .ics so the OS hands it to the installed calendar app (Apple
// Calendar / Google Calendar / Outlook). No forced download.
function openCalendar(evt) {
  const ics = buildIcs(evt);
  const dataUri =
    "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);

  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/i.test(ua);

  if (isIOS) {
    // iOS: navigate in the same tab so Safari hands off to Calendar app.
    window.location.href = dataUri;
    return;
  }

  // Android / Desktop: open in a new tab, the OS routes it to the
  // installed calendar app.
  const w = window.open(dataUri, "_blank", "noopener,noreferrer");
  if (!w) {
    // Pop-up blocked — fall back to same-tab navigation.
    window.location.href = dataUri;
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
