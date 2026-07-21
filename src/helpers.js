/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// FS is a built in module to node that let's us read files from the system we're running on
const fs = require('fs');

const currency = require('currency.js');

// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
exports.moment = require('moment');

// Making a static map is really long - this is a handy helper function to make one

// inserting an SVG
exports.icon = (name) => {
  try {
    return fs.readFileSync(`./public/images/icons/${name}.svg`);
  } catch (error) {
    return null;
  }
};

exports.image = (name) => fs.readFileSync(`./public/images/photos/${name}.jpg`);

// Some details about the site
exports.siteName = `Express.js / MongoBD / Rest Api`;

exports.timeRange = (start, end, format, interval) => {
  if (format == undefined) {
    format = 'HH:mm';
  }

  if (interval == undefined) {
    interval = 60;
  }
  interval = interval > 0 ? interval : 60;

  const range = [];
  while (moment(start).isBefore(moment(end))) {
    range.push(moment(start).format(format));
    start = moment(start).add(interval, 'minutes');
  }
  return range;
};

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const chunkToWords = (num) => {
  let words = '';
  if (num >= 100) {
    words += ONES[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    words += TENS[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    words += ONES[num] + ' ';
  }
  return words;
};

// Converts an integer amount into English words, e.g. 1500 -> "One Thousand Five Hundred"
exports.numberToWords = (amount) => {
  let num = Math.round(Math.abs(Number(amount) || 0));
  if (num === 0) return 'Zero';

  const scales = [
    { value: 10000000, name: 'Crore' },
    { value: 100000, name: 'Lakh' },
    { value: 1000, name: 'Thousand' },
  ];

  let words = '';
  for (const { value, name } of scales) {
    if (num >= value) {
      words += chunkToWords(Math.floor(num / value)) + name + ' ';
      num %= value;
    }
  }
  words += chunkToWords(num);

  return words.trim();
};

exports.calculate = {
  add: (firstValue, secondValue) => {
    return currency(firstValue).add(secondValue).value;
  },
  sub: (firstValue, secondValue) => {
    return currency(firstValue).subtract(secondValue).value;
  },
  multiply: (firstValue, secondValue) => {
    return currency(firstValue).multiply(secondValue).value;
  },
  divide: (firstValue, secondValue) => {
    return currency(firstValue).divide(secondValue).value;
  },
};
