/**
 * Clears a fields value
 * @param {string} fieldName - The name of the field
 * @return {void}
 */
function clearField(fieldName) {
    document.getElementById(fieldName).value = '';
}

/**
 * Hides an element
 * @param {string} elementName - The name of the element
 * @param {boolean} clear - Clears the field
 * @return {void}
 */
function hideElement(elementName, clear = false) {
    const element = document.getElementById(elementName);
    element.style.display = 'none';

    if (clear) element.value = '';
}

/**
 * Shows an element
 * @param {string} elementName - The name of the element
 * @param {string} [display='flex'] - The display type
 * @return {void}
 */
function showElement(elementName, display = 'flex') {
    document.getElementById(elementName).style.display = display;
}