function trimObjectValues(obj: Record<string, unknown>): Record<string, any> {
  const object: any = {}

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') return (object[key] = value.trim())

    return (object[key] = value)
  })

  return object
}

export { trimObjectValues }
