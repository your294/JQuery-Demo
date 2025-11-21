/**
 * 用str替换指定位置的一个特殊字符
 * @param {number} index - 替换的位置的索引 
 * @param {string} str - 替换内容 
 * @returns 
 */
function replaceSpecialChar(index, str) {
    if (index === -1) return;
    const selection = window.getSelection();
    if (selection.rangeCount < 1) return;
    const range = selection.getRangeAt(0);
    const focusNode = selection.focusNode;
    range.setStart(focusNode, index);
    range.setEnd(focusNode, index + 1);
    // 清除特殊字符 要准备插入新的替换内容
    range.deleteContents();
    const spanELwithText = createAtSpanTag(str);
    range.insertNode(spanELwithText);
    // 这里需要控制下range的start去哪里
    /** @type {Node} */
    const parent = spanELwithText.parentNode;
    if (!parent || !(parent instanceof Node)) return;
    const spanIdx = Array.from(parent.childNodes).indexOf(spanELwithText, 0);
    if (spanIdx !== -1) {
        range.setStart(parent, spanIdx + 1);
        range.collapse(false);
    } else {
        // 将range收缩到末尾 false是开头
        range.collapse(true);
    }
}

/**
 * 创建特殊‘@’字符的替换span tag
 * @param {string} str - 创建的插入的特殊span字符 
 * @returns {Element}
 */
function createAtSpanTag(str) {
    /** @type {HTMLSpanElement} */
    const spanEL = document.createElement('span');
    spanEL.classList.add('at-span');
    spanEL.innerText = `@${str}`;
    spanEL.contentEditable = false;
    return spanEL;
}

/**
 * 观察输入执行代码 
 * @returns {{
 *   atIndex: number,
 *   cursorLength: number
 * }}
 */
function onObserveInput() {
    const selection = window.getSelection();
    if (!selection) return;
    /** @type {CharacterData} */
    const focusNode = selection.focusNode;
    if (!(focusNode instanceof CharacterData)) return;
    let cursorBeforeStr = focusNode.data.slice(0, selection.focusOffset);
    const atIndex = cursorBeforeStr.lastIndexOf('@');
    return {
        atIndex,
        cursorLength: cursorBeforeStr.length
    };
}

