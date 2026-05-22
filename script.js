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

// Route the .ics (with its VALARM 12-hour reminder) to the user's
// installed calendar app:
//
//   1. Web Share API with a file (preferred when available) -- opens
//      the native share sheet on Android/iOS so the user picks Google
//      Calendar / Apple Calendar / Outlook, which receives the .ics
//      content directly. No file is saved to the device, and the
//      VALARM (12-hour reminder) is preserved.
//
//   2. iOS Safari fallback -- navigate to the .ics data URI, which
//      iOS hands off to Apple Calendar directly.
//
//   3. Final fallback -- trigger an .ics download. Tapping the
//      downloaded file opens it in the calendar app with the reminder
//      intact.
async function openCalendar(evt) {
  const ics = buildIcs(evt);
  const filename =
    evt.title.replace(/[^a-z0-9]+/gi, "_") + ".ics";
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });

  // 1. Web Share API with a file (Android Chrome 89+, iOS Safari 15+,
  //    desktop Chrome 89+).
  try {
    if (typeof File !== "undefined" && navigator.canShare) {
      const file = new File([blob], filename, {
        type: "text/calendar",
      });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: evt.title,
          text: "Add to your calendar",
        });
        return;
      }
    }
  } catch (err) {
    if (err && err.name === "AbortError") return; // user cancelled
  }

  // 2. iOS Safari (older) -- navigate to the .ics data URI.
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (ua.includes("Mac") && navigator.maxTouchPoints > 1);

  if (isIOS) {
    window.location.href =
      "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
    return;
  }

  // 3. Last resort -- download the .ics. The 12-hour reminder is in
  //    the file; the user taps it to add to their calendar.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 5000);
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
