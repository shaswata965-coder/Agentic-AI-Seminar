#!/usr/bin/env node
/*
 * A minimal SMTP server that accepts every message and counts it, so the site's e-mails (sent with
 * nodemailer after each registration and enquiry) are part of the load test without reaching anyone.
 * Every second it writes its counts to SMTP_SINK_STATS, which tools/verify.mjs reads.
 *
 *   SMTP_SINK_PORT=2525 SMTP_SINK_STATS=smtp-stats.json node smtp-sink.mjs
 *
 * SMTP_SINK_DELAY_MS adds a delay before each message is accepted, like a real mail server's.
 */
import { writeFileSync } from "node:fs";
import net from "node:net";

const port = Number(process.env.SMTP_SINK_PORT ?? 2525);
const statsFile = process.env.SMTP_SINK_STATS ?? "smtp-stats.json";
const delayMs = Number(process.env.SMTP_SINK_DELAY_MS ?? 0);

const KINDS = [
  ["workshop-confirmation", /^You're registered:/],
  ["team-confirmation", /^Team registered:/],
  ["enquiry-ack", /^We received your/],
  ["organiser-team-notice", /^New hackathon team:/],
  ["organiser-enquiry-notice", /^(Contact message|Exhibitor enquiry|Sponsorship enquiry) from/],
];

const stats = { messages: 0, recipients: 0, connections: 0, open: 0, peakOpen: 0, byKind: {}, perRecipient: {} };

function record(subject, rcpts) {
  stats.messages += 1;
  stats.recipients += rcpts.length;
  const kind = KINDS.find(([, re]) => re.test(subject))?.[0] ?? "other";
  stats.byKind[kind] = (stats.byKind[kind] ?? 0) + 1;
  for (const r of rcpts) stats.perRecipient[r] = (stats.perRecipient[r] ?? 0) + 1;
}

function decodeSubject(raw) {
  // RFC 2047 encoded words, as nodemailer writes non-ASCII subjects.
  return raw.replace(/=\?utf-8\?([bq])\?([^?]*)\?=\s*/gi, (_, enc, text) =>
    enc.toLowerCase() === "b" ? Buffer.from(text, "base64").toString("utf8") : decodeURIComponent(text.replace(/_/g, " ").replace(/=([0-9a-f]{2})/gi, "%$1")),
  );
}

const server = net.createServer((sock) => {
  stats.connections += 1;
  stats.open += 1;
  stats.peakOpen = Math.max(stats.peakOpen, stats.open);
  sock.setEncoding("utf8");
  let buf = "";
  let inData = false;
  let rcpts = [];
  const reply = (line) => sock.writable && sock.write(`${line}\r\n`);
  reply("220 loadtest-sink ESMTP");

  sock.on("data", (chunk) => {
    buf += chunk;
    for (;;) {
      if (inData) {
        const end = buf.indexOf("\r\n.\r\n");
        if (end === -1) return;
        const message = buf.slice(0, end);
        buf = buf.slice(end + 5);
        inData = false;
        const header = message.split("\r\n\r\n")[0].replace(/\r\n[ \t]+/g, " ");
        const subject = decodeSubject(/^subject: (.*)$/im.exec(header)?.[1] ?? "");
        const done = rcpts;
        rcpts = [];
        setTimeout(() => {
          record(subject, done);
          reply("250 2.0.0 queued");
        }, delayMs);
        continue;
      }
      const nl = buf.indexOf("\r\n");
      if (nl === -1) return;
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 2);
      const cmd = line.slice(0, 4).toUpperCase();
      if (cmd === "EHLO") reply("250-loadtest-sink\r\n250-PIPELINING\r\n250-8BITMIME\r\n250 SMTPUTF8");
      else if (cmd === "HELO") reply("250 loadtest-sink");
      else if (cmd === "MAIL") reply("250 2.1.0 ok");
      else if (cmd === "RCPT") {
        rcpts.push((/<([^>]*)>/.exec(line)?.[1] ?? "").toLowerCase());
        reply("250 2.1.5 ok");
      } else if (cmd === "DATA") {
        inData = true;
        reply("354 end with <CRLF>.<CRLF>");
      } else if (cmd === "RSET") {
        rcpts = [];
        reply("250 ok");
      } else if (cmd === "NOOP") reply("250 ok");
      else if (cmd === "QUIT") {
        reply("221 bye");
        sock.end();
      } else reply("502 5.5.2 not implemented");
    }
  });
  const closed = () => {
    if (sock.counted) return;
    sock.counted = true;
    stats.open -= 1;
  };
  sock.on("close", closed);
  sock.on("error", closed);
});

function save() {
  const counts = Object.values(stats.perRecipient);
  const { perRecipient, ...rest } = stats;
  writeFileSync(statsFile, JSON.stringify({ ...rest, uniqueRecipients: counts.length, maxPerRecipient: counts.length ? Math.max(...counts) : 0, perRecipient }, null, 1));
}
setInterval(save, 1000).unref();
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => (save(), process.exit(0)));

server.listen(port, "127.0.0.1", () => console.log(`[smtp-sink] listening on 127.0.0.1:${port}, stats in ${statsFile}`));
