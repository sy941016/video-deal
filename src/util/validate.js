/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
    const valid_map = ['shiyuan']
    return valid_map.indexOf(str.trim()) >= 0
}