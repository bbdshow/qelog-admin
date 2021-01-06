export function calcSize(val) {
  let divCount = 0
  for (; val > 1024;) {
    divCount++
    val = val / 1024
    if (divCount >= 2) {
      break
    }
  }
  switch (divCount) {
    case 0:
      return {
        number: val, unit: 'B'
      }
    case 1:
      return {
        number: val, unit: 'KB'
      }
    case 2:
      return {
        number: val, unit: 'MB'
      }
  }
}

export function calcNum(val) {
  let divCount = 0
  for (; val > 10000;) {
    divCount++
    val = val / 10
    if (divCount >= 4) {
      break
    }
  }
  switch (divCount) {
    case 3:
      return {
        number: val, unit: 'K'
      }
    case 4:
      return {
        number: val, unit: '10K'
      }
    default:
      return {
        number: val, unit: ''
      }
  }
}
