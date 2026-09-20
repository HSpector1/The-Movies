/**
 * Source-level bounds for the dense-array merge sort below. These count
 * comparator calls and element-reference writes, not native allocation cost
 * or the work performed inside a caller's comparator.
 */
export function boundedStableSortCost(length: number): Readonly<{
  maxComparisons: number
  maxElementWrites: number
}> {
  if (!Number.isInteger(length) || length < 0 || length > 0xffffffff) {
    throw new RangeError('Bounded stable sort requires a native-array length.')
  }
  if (length === 0) return { maxComparisons: 0, maxElementWrites: 0 }
  let passes = 0
  for (let width = 1; width < length; width *= 2) passes++
  return {
    maxComparisons: length * passes,
    maxElementWrites: length * (passes + 1),
  }
}

/**
 * Stable ordering of dense ordinary arrays, preserving every element identity.
 * Each merge pass writes every slot once; the initial shallow copy is the only
 * other element copy. Returning the final source avoids a trailing copy.
 */
export function boundedStableSort<T>(
  values: readonly T[],
  compare: (left: T, right: T) => number,
): T[] {
  const length = values.length
  let source = values.slice()
  if (length < 2) return source
  let target = new Array<T>(length)

  for (let width = 1; width < length; width *= 2) {
    for (let start = 0; start < length; start += 2 * width) {
      const middle = Math.min(start + width, length)
      const end = Math.min(start + 2 * width, length)
      let left = start
      let right = middle
      let output = start
      while (left < middle && right < end) {
        const order = compare(source[left]!, source[right]!)
        // Native comparator semantics: NaN, like zero, is a stable tie.
        if (order <= 0 || Number.isNaN(order)) {
          target[output++] = source[left++]!
        } else {
          target[output++] = source[right++]!
        }
      }
      while (left < middle) target[output++] = source[left++]!
      while (right < end) target[output++] = source[right++]!
    }
    const previous = source
    source = target
    target = previous
  }
  return source
}
