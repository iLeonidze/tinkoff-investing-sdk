function numberWithCommas(value) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function magicString(value) {
  if (typeof value === 'number') {
    return numberWithCommas(value);
  } else if (typeof value === 'boolean') {
    return value ? '+' : '';
  } else {
    return value.toString();
  }
}

module.exports = (array) => {
  if (array.length < 2) {
    throw new Error('Table is too small');
  }

  let result = '';

  const maxSizes = [];

  for (const i in array[0]) {
    maxSizes[i] = 0;
    array[0][i] = array[0][i].toString().toUpperCase();
  }

  for (const i in array) {
    for (const j in array[i]) {
      array[i][j] = magicString(array[i][j]);
      if (array[i][j].length > maxSizes[j]) {
        maxSizes[j] = array[i][j].length;
      }
    }
  }

  for (const i in array) {
    let raw = '';
    for (const j in array[i]) {
      raw += array[i][j] + ' '.repeat((maxSizes[j] - array[i][j].length) + 2);
    }
    if (i !== array.length - 1) {
      raw += '\n';
    }
    result += raw;
  }

  return result;
}
