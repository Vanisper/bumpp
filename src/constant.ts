interface DefaultOptions {
  recursive?: boolean
  /**
   * Project declaration file for the javascript runtime tool
   * @description It is mainly for compatibility with scenarios such as `Deno`.
   * Generally, it is 'package.json'.
   */
  primary?: boolean
}

function createDefault(fileName: string, options?: DefaultOptions) {
  return {
    name: fileName,
    primary: Boolean(options?.primary),
    recursive: Boolean(options?.recursive),
    glob: options?.recursive ? `packages/**/${fileName}` : null,
  }
}

function createPrimaryDefault(fileName: string, recursive = false) {
  return createDefault(fileName, { primary: true, recursive })
}

/**
 * Default files to update when bumping versions.
 *
 * ---
 *
 * NOTE: Don't use `for-in` loops on this object,
 * plz use `itself.getList` or `itself.raw` .etc instead.
 */
export const defaultFiles = (() => {
  const defaults = [
    // TODO: Only 'package.json' is recursive?
    createPrimaryDefault('package.json', true),
    createDefault('package-lock.json'),
    createPrimaryDefault('deno.json'),
    createPrimaryDefault('deno.jsonc'),
    createPrimaryDefault('Cargo.toml'),
    createDefault('jsr.json'),
    createDefault('jsr.jsonc'),
  ]

  const primaryList = defaults.filter(file => file.primary).map(file => file.name)

  const result = Object.assign([...defaults], {
    raw: defaults,
    /**
     * Returns a list of file names or globs.
     * @description If `full` is true, it includes glob patterns for recursive files.
     */
    getList(full = false) {
      return full
        ? defaults.flatMap(file => file.glob ? [file.name, file.glob] : [file.name])
        : defaults.map(file => file.name)
    },
    /**
     * Checks if a file name or glob is in the default files list.
     * @param fileName - The name or glob pattern to check.
     * @param insensitive - Whether to ignore case when checking the file name.
     * @param full - Whether to check against the full glob patterns.
     */
    has(fileName: string, insensitive = false, full = false) {
      return defaults.some((file) => {
        const nameMatch = insensitive
          ? file.name.trim().toLowerCase() === fileName.trim().toLowerCase()
          : file.name === fileName
        return nameMatch || (full && file.glob && file.glob === fileName)
      })
    },
    /**
     * Returns a list of primary file names.
     */
    primaryList,
    /**
     * Merges the input list with missing primary files,
     * ensuring all primary files are included.
     */
    primaryComplementer(list: string[] = []) {
      const missing = primaryList.filter(file => !list.includes(file))
      return [...list, ...missing]
    },
  })

  return Object.freeze(result)
})()
