// Order only the supplied collection members; references never add membership.
export function orderCollectionOriginals<T extends { _id: string }>(
  originals: readonly T[],
  orderedIds: readonly string[] = []
): T[] {
  const remaining = new Map<string, T>();
  for (const original of originals) {
    if (!remaining.has(original._id)) remaining.set(original._id, original);
  }

  const ordered: T[] = [];
  for (const id of orderedIds) {
    const original = remaining.get(id);
    if (!original) continue;
    ordered.push(original);
    remaining.delete(id);
  }

  return [...ordered, ...remaining.values()];
}
