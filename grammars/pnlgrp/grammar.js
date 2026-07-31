const TAGS = require("../../data/pnlgrp-tags.json");

const PAIRS = {
  CIT: "ECIT",
  CLASS: "ECLASS",
  DATA: "EDATA",
  DATAGRP: "EDATAGRP",
  DL: "EDL",
  FIG: "EFIG",
  HELP: "EHELP",
  INFO: "EINFO",
  KEYL: "EKEYL",
  LINES: "ELINES",
  LINK: "ELINK",
  LIST: "ELIST",
  LISTGRP: "ELISTGRP",
  MBAR: "EMBAR",
  MBARC: "EMBARC",
  MENU: "EMENU",
  MENUGRP: "EMENUGRP",
  NOTE: "ENOTE",
  NT: "ENT",
  OL: "EOL",
  PANEL: "EPANEL",
  PARML: "EPARML",
  PDFLD: "EPDFLD",
  PK: "EPK",
  PNLGRP: "EPNLGRP",
  PRTHEAD: "EPRTHEAD",
  PRTPNL: "EPRTPNL",
  PV: "EPV",
  RT: "ERT",
  SL: "ESL",
  TL: "ETL",
  TT: "ETT",
  UL: "EUL",
  XMP: "EXMP",
  ...Object.fromEntries(
    Array.from({ length: 10 }, (_, index) => [`HP${index}`, `EHP${index}`]),
  ),
};

const PAIRED_NAMES = new Set([...Object.keys(PAIRS), ...Object.values(PAIRS)]);
const TERMINAL_TAGS = [...new Set([...TAGS, "FIGCAP"])].filter(
  (tag) => !PAIRED_NAMES.has(tag),
);
const PAIR_RULES = Object.fromEntries(
  Object.entries(PAIRS).flatMap(([opening, closing]) => [
    [startRuleName(opening), ($) => tagRule($, opening, true)],
    [endRuleName(opening), ($) => tagRule($, closing, false)],
  ]),
);

module.exports = grammar({
  name: "ibmi_pnlgrp",

  extras: () => [/\r?\n/],

  rules: {
    source_file: ($) => repeat($._content),

    ...PAIR_RULES,

    _content: ($) =>
      choice(
        $.element,
        $.tag,
        $.entity,
        $.comment,
        $.imbed_directive,
        $.colon_line,
        $.colon_space,
        $.text,
      ),

    element: ($) =>
      choice(
        ...Object.entries(PAIRS).map(([opening, closing]) =>
          seq(
            field(
              "open",
              alias($[startRuleName(opening)], $.start_tag),
            ),
            repeat($._content),
            field(
              "close",
              alias($[endRuleName(opening)], $.end_tag),
            ),
          ),
        ),
      ),

    tag: ($) =>
      seq(
        ":",
        field("name", alias(tagChoice(TERMINAL_TAGS), $.tag_name)),
        repeat(seq($._tag_space, field("attribute", $.attribute))),
        optional($._tag_space),
        ".",
      ),

    attribute: ($) =>
      seq(
        field("name", $.attribute_name),
        optional(seq("=", field("value", $._attribute_value))),
      ),

    _tag_space: () => token(/[ \t\r\n]+/),

    _attribute_value: ($) => choice($.quoted_value, $.bare_value),

    attribute_name: () => token(/[A-Za-z][A-Za-z0-9]*/),

    quoted_value: () =>
      token(choice(/'([^'\r\n]|'')*'/, /"([^"\r\n]|"")*"/)),

    bare_value: () => token(/[^ \t\r\n.=]+/),

    entity: () => token(/&[A-Za-z#@$§_][^\.\r\n]*\./),

    comment: () => token(prec(2, seq(".*", /[^\r\n]*/, optional(/\r?\n/)))),

    imbed_directive: () =>
      token(prec(2, seq(/\.[Ii][Mm]/, /[ \t]+/, /[^\r\n]*/, optional(/\r?\n/)))),

    colon_line: () => token(prec(2, seq(":", /\r?\n/))),

    colon_space: () => token(prec(2, /:[ \t]+/)),

    text: () => token(prec(-1, /[^:&\r\n]+/)),
  },
});

function startRuleName(name) {
  return `_start_${name.toLowerCase()}`;
}

function endRuleName(name) {
  return `_end_${name.toLowerCase()}`;
}

function tagRule($, name, attributes) {
  return seq(
    ":",
    field("name", alias(caseInsensitive(name), $.tag_name)),
    ...(attributes
      ? [
          repeat(seq($._tag_space, field("attribute", $.attribute))),
          optional($._tag_space),
        ]
      : []),
    ".",
  );
}

function tagChoice(tags) {
  return token(choice(...tags.map(caseInsensitive)));
}

function caseInsensitive(value) {
  return new RegExp(
    value
      .split("")
      .map((character) => `[${character}${character.toLowerCase()}]`)
      .join(""),
  );
}
