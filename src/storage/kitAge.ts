export function calcAgeInMonths(dateOfBirth: string, today = new Date()): number | null {
  if (!dateOfBirth) return null
  const [year, month, day] = dateOfBirth.split('-').map(Number)
  if (!year || !month || !day) return null

  const birth = new Date(year, month - 1, day)
  if (Number.isNaN(birth.getTime()) || birth > today) return null

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth())

  if (today.getDate() < birth.getDate()) months -= 1
  return Math.max(0, months)
}
