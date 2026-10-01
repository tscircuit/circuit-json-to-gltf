/** Keep export available when a supported flat PCB cannot be folded.
 * Both callbacks return geometry in the same frame; this helper only reports
 * the failed fold and selects the existing flat geometry.
 */
export function withPcbFoldFallback<T>(
  label: string,
  foldGeometry: () => T,
  flatGeometry: () => T,
): T {
  try {
    return foldGeometry()
  } catch (error) {
    console.warn(
      `Unable to fold ${label}; keeping flat geometry: ${error instanceof Error ? error.message : String(error)}`,
    )
    return flatGeometry()
  }
}
