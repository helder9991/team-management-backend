function removeUndefinedProperties<T>(obj: T): Partial<T> {
  const sanitizedObj: Partial<T> = {}

  for (const key in obj) {
    if (obj[key] !== undefined) {
      sanitizedObj[key] = obj[key]
    }
  }

  return sanitizedObj as T
}

export default removeUndefinedProperties
