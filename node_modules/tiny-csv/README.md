# tiny-csv

[![NPM version][npm-img]][npm-url]
[![License][license-img]][license-url]
[![Build status][travis-img]][travis-url]

Parse a CSV string into an array of objects.

## Installation

```
npm install tiny-csv
```

## Usage

``` javascript
var fs  = require('fs')
var csv = require('tiny-csv')

var csvData = fs.readFileSync('data.csv', 'utf8')
console.log(csv(csvData))
// [
//   { key: 'one', value: 'two' },
//   { key: 'three', value: 'four' },
//   { key: 'five', value: 'six' }
// ]

var tsvData = fs.readFileSync('data.tsv', 'utf8')
console.log(csv(tsvData, /\t/))
// [
//   { key: 'one', value: 'two' },
//   { key: 'three', value: 'four' },
//   { key: 'five', value: 'six' }
// ]
```

## Caveats

The module is meant to be used on smaller sets of data. If you need maximum
speed, use [csv-parser][csv-parser].

[npm-img]: https://img.shields.io/npm/v/tiny-csv.svg?style=flat-square
[npm-url]: https://npmjs.org/package/tiny-csv
[license-img]: http://img.shields.io/npm/l/tiny-csv.svg?style=flat-square
[license-url]: LICENSE
[travis-img]: https://img.shields.io/travis/gummesson/tiny-csv.svg?style=flat-square
[travis-url]: https://travis-ci.org/gummesson/tiny-csv
[csv-parser]: https://github.com/mafintosh/csv-parser/
