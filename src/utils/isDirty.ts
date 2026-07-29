export default function isDirty(obj1: any, obj2: any) {
  // 1. Strict equality check (handles identical references and primitives)
  if (obj1 === obj2) return false;

  // 2. Check if either is null/undefined or not an object
  if (
    obj1 === null || 
    obj2 === null || 
    typeof obj1 !== 'object' || 
    typeof obj2 !== 'object'
  ) {
    return obj1 !== obj2;
  }

  // 3. Handle special Date objects
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() !== obj2.getTime();
  }

  // 4. Handle special RegExp objects
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
    return obj1.toString() !== obj2.toString();
  }

  // 5. Handle Arrays
  const isArr1 = Array.isArray(obj1);
  const isArr2 = Array.isArray(obj2);

  if (isArr1 !== isArr2) return true; // One is an array, the other isn't

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // 6. Check if key counts match
  if (keys1.length !== keys2.length) return true;

  // 7. Recursively check all nested keys/indices
  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) return true;
    
    // If a recursive check finds a difference, the objects are dirty
    if (isDirty(obj1[key], obj2[key])) {
      return true;
    }
  }

  // If no differences were found, they are identical (not dirty)
  return false;
}