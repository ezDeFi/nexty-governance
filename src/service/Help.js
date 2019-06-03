export function cutString (s) {
  if (s.length < 20) return s
  var first5 = s.substring(0, 5).toLowerCase()
  var last3 = s.slice(-3)
  return first5 + '...' + last3
}