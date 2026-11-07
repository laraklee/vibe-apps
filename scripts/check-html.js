#!/usr/bin/env node
// Checks HTML apps for things that need Lara's attention: AI service calls,
// tracking or cloud databases, outside hosts, network calls, and personal info.
//
//   node scripts/check-html.js [--strict] FILE_OR_FOLDER ...
//
// MUST FIX problems always fail. Warnings fail only with --strict (the Claude hook).
const fs = require('fs');
const path = require('path');

// Hosts apps may load scripts, styles, and fonts from. Ask Lara before adding one.
const ALLOWED_HOSTS = [
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'code.jquery.com',
];

const MUST_FIX = [
  [/generativelanguage\.googleapis\.com|aiplatform\.googleapis\.com|api\.openai\.com|api\.anthropic\.com/i,
    'calls an AI service (needs a key and may send student input). Talk to Lara.'],
  [/googletagmanager|google-analytics|\bgtag\(|facebook\.net|hotjar|clarity\.ms/i,
    'contains tracking/analytics code.'],
  [/firebase|firestore|__firebase_config|__initial_auth_token/i,
    'uses Firebase (cloud storage). Gemini adds this; it may store student data. Talk to Lara.'],
];

const WARN = [
  [/\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\s*\(/,
    'sends or loads data over the network. Check where it goes.'],
  [/<form[^>]*action\s*=\s*["']?https?:/i, 'form sends data to another site.'],
  [/type\s*=\s*["']email["']|your (full )?name|student (name|id)/i,
    'asks for personal info. Make sure it stays on the device.'],
];

// Outside resources loaded by the page (not ordinary <a href> links).
const LOAD_URL = /(?:\bsrc\s*=\s*["']?|<link[^>]*href\s*=\s*["']?|@import\s+(?:url\()?["']?|url\(\s*["']?|\bfrom\s+["']|import\(\s*["'])https?:\/\/([a-z0-9.-]+)/gi;

const strict = process.argv.includes('--strict');
const targets = process.argv.slice(2).filter((a) => a !== '--strict');
if (targets.length === 0) targets.push('apps');

function collect(p, out) {
  if (!fs.existsSync(p)) return out;
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(p)) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      collect(path.join(p, name), out);
    }
  } else if (/\.(html?|js)$/i.test(p)) {
    out.push(p);
  }
  return out;
}

const files = targets.flatMap((t) => collect(t, []));
let errors = 0;
let warnings = 0;

for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const where = `${file}:${i + 1}`;
    for (const [re, msg] of MUST_FIX) {
      if (re.test(line)) { console.log(`  ${where}  MUST FIX  ${msg}`); errors++; }
    }
    for (const [re, msg] of WARN) {
      if (re.test(line)) { console.log(`  ${where}  WARN  ${msg}`); warnings++; }
    }
    for (const m of line.matchAll(LOAD_URL)) {
      const host = m[1].toLowerCase();
      if (!ALLOWED_HOSTS.includes(host)) {
        console.log(`  ${where}  WARN  loads from ${host}, which isn't on the allowed list.`);
        warnings++;
      }
    }
  });
}

console.log(`   ${files.length} file(s) checked: ${errors} must-fix, ${warnings} warning(s).`);
process.exit(errors > 0 || (strict && warnings > 0) ? 1 : 0);
