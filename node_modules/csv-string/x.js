function detect (input)
{
    var separators = [',', ';', '|', '\t'];
    var idx = separators.map(function (separator) {
          return input.indexOf(separator);
        }).reduce(function (prev, cur) {
              if (prev === -1 || cur !== -1 && cur < prev) {
                      return cur;
                    }
              else {
                      return prev;
                    }
            });
    return input[idx] || ',';
}

console.log(detect("a;b;c\nd;e;f\ng;h;i"));

