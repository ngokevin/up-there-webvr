/**
 * Exports
 */

module.exports = csv

/**
 * Parse a CSV string into an array of objects.
 *
 * @param  {String}        input
 * @param  {String|RegExp} delimiter
 * @return {Array<Object>}
 *
 * @api public
 */

function csv(input, delimiter) {
  if (!input) return []
  delimiter = delimiter || ','

  var lines  = toArray(input, /\r?\n/)
  var first  = lines.shift()
  var header = toArray(first, delimiter)

  var data = lines.map(function(line) {
    var row = toArray(line, delimiter)
    return toObject(row, header)
  })

  return data
}

/**
 * Parse a string into an array by splitting it
 * at `delimiter` and filtering out empty values.
 *
 * @param  {String}        line
 * @param  {String|RegExp} delimiter
 * @return {Array}
 *
 * @api private
 */

function toArray(line, delimiter) {
  var arr = line
    .split(delimiter)
    .filter(Boolean)
  return arr
}

/**
 * Construct an object by using the items in `row`
 * as values and the items in `header` as keys.
 *
 * @param  {Array} row
 * @param  {Array} header
 * @return {Object}
 *
 * @api private
 */

function toObject(row, header) {
  var obj = {}
  row.forEach(function(value, key) {
    obj[header[key]] = value
  })
  return obj
}
