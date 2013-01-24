#!/usr/bin/env node

var ESC = '\u001b';
var CSI = ESC + '[';

var pictureTube = require('picture-tube');
var fs = require('fs');
var path = require('path');

var TITLE = 'T H E   C A V A G E R !';

function drawFunc(idx, cb)
{
  // Excellent Maths:
  var cols = process.stdout.columns - 1;
  var height = Math.floor(cols / 2.8172);
  if (height >= process.stdout.rows - 1) {
    cols = Math.floor((process.stdout.rows - 1) * 2.8172);
    /* MARK, YOU ARE TOO TALL */
  }

  process.stdout.write(CSI + '1;2f' + ' cols : ' + cols);

  // moveto top-left
  process.stdout.write(CSI + '1;3f');

  var tube = pictureTube({ cols: cols });
  tube.pipe(process.stdout);

  var fn = path.join(__dirname, 'img', 'cavage' + idx + '.png');
  fs.createReadStream(fn).pipe(tube);

  tube.on('end', function() { return cb(); });
}

function fill(c, num)
{
  var out = '';
  while (out.length < num)
    out += c;
  return out;
}

var REVERSE = true;
var IDX = 0;
function interfunc()
{
  IDX = (IDX + 1) % 2;
  drawFunc(IDX, function() {
    REVERSE = !REVERSE;
    var sw = Math.floor(process.stdout.columns - TITLE.length - 2) / 2 - 1;
    var fi = fill(' ', sw);
    process.stdout.write(CSI + '1;1f'); // move to top left
    process.stdout.write(fi);
    process.stdout.write(REVERSE ? CSI + '7m' : '');
    process.stdout.write(' ' + TITLE + ' ');
    process.stdout.write(REVERSE ? CSI + 'm' : '');
    process.stdout.write(fi);

    setTimeout(interfunc, 500);
  });
}

function on_end()
{
  process.stdout.write(CSI + '2J');
  process.stdout.write(CSI + '1;1f');
  process.stdout.write(CSI + '?25h');
  process.exit(0);
}

process.on('exit', on_end);
process.on('SIGINT', on_end);
process.on('SIGTERM', on_end);


// clear screen
process.stdout.write(CSI + '2J');
// disable cursor
process.stdout.write(CSI + '?25l');

// and, go!
interfunc();
