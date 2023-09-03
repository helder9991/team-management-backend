function removeUndefinedProperties<T>(obj: T): T {
  const sanitizedObj: Partial<T> = {}

  for (const key in obj) {
    if (obj[key] !== undefined) {
      sanitizedObj[key] = obj[key]
    }
  }

  return sanitizedObj as T
}

export default removeUndefinedProperties
