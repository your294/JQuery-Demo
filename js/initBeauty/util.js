/**
 * 安全初始化 iCheck 插件（避免重复初始化）
 * @param {jQuery} $elements - 要初始化的 jQuery 元素集合
 * @param {Object} options - iCheck 配置选项
 */
function safeInitICheck($elements, options = {}) {
    $elements.each(function() {
        const $el = $(this);
        if ($el.data('icheck-initialized')) {
            // 已初始化，跳过
            return;
        }
        // 初始化 iCheck
        $el.iCheck(options);
        // 标记为已初始化
        $el.data('icheck-initialized', true);
    });
}

/**
 * 安全初始化 Chosen 插件（避免重复初始化）
 * @param {jQuery} $elements - 要初始化的 jQuery 元素集合
 * @param {Object} options - Chosen 配置选项
 */
function safeInitChosen($elements, options = {}) {
    $elements.each(function() {
        const $el = $(this);
        if ($el.data('chosen-initialized')) {
            return;
        }
        $el.chosen(options);
        $el.data('chosen-initialized', true);
    });
}