// jQuery DropDownList 插件
/**
 * @typedef {Object} Settings
 * @property {Array} [data]
 */
(function ($) {
  $.fn.dropDownList = function (options) {
    // 默认配置
    var defaults = {
      origin: "",
      data: [], // 格式: [{ value: '1', text: '选项1' }, ...]
      onSelect: function (item) {}, // 回调：选中时触发
    };

    // 合并用户配置
    /** @type {Settings} */
    var settings = $.extend({}, defaults, options);

    // 遍历每个目标元素
    return this.each(function () {
      var $editor = $(this);
      /** @type {JQuery | null} */
      var $dropdown = null;
      /** @type {Text | null} */
      var cursorFocusNode = null;
      /** @type {string} */
      var originData = "";
      /** @type {number} */
      var selectIndex = 0;

      // 如果已经是下拉组件，避免重复初始化（可选）
      if ($editor.data("dropDownList-initialized")) return;

      // 标记已初始化
      $editor.data("dropDownList-initialized", true);

      // === 私有方法区域 ===

      function init() {
        render();
        bindEvents();
      }

      function render() {
        // <ul><li></li></ul> 形式列表

        var $list = $('<ul class="dd-list none"></ul>');

        // 渲染选项
        $.each(settings.data, function (i, item) {
          var $li = $(
            '<li data-value="' + item.value + '">' + item.text + "</li>"
          );
          $list.append($li);
        });

        $list.data("list-data", settings.data);
        $list.data("at-index", -1);
        $list.data("origin", settings.origin);
        $list.insertAfter($editor);
        $dropdown = $list;
      }

      /**
       * 监听编辑器输入 不支持input 需要div.contentEditable
       * @param {JQuery.Event} e
       */
      function handleEditorInput(e) {
        const data = e.originalEvent.data;

        // 只有当输入的是实际字符时才处理
        if (data === null || data === undefined) {
          // Enter、Backspace、Delete 等键会触发 input 但 data 为 null
          return;
        }

        originData += data;
        const { atIndex, cursorLength } = onObserveInput(cursorFocusNode);
        $dropdown.data("at-index", atIndex);
        if (atIndex !== -1 && atIndex === cursorLength - 1) {
          const { x, y } = getCursorPosition();
          $dropdown.css("top", `${y}px`).css("left", `${x}px`);
          openList();
        } else {
          closeList();
        }
      }

      /**
       *
       * @param {JQuery.KeyUpEvent} e
       * @returns
       */
      function handleEditorKey(e) {
        const isShow = !$editor.hasClass("none");
        if (!isShow) return;
        /** @type {JQuery<HTMLElement>} */
        const listItems = $dropdown.find("li");
        e.preventDefault();
        switch (e.key) {
          case "ArrowUp":
            selectIndex = Math.max(0, selectIndex - 1);
            break;
          case "ArrowDown":
            selectIndex = Math.min(listItems.length - 1, selectIndex + 1);
            break;
          case "Escape":
            closeList();
            break;
          default:
            break;
        }
        listItems.each((index, ele) => {
          const $ele = $(ele);
          if (index === selectIndex) {
            $ele.addClass("active");
            ele.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          } else {
            $ele.removeClass("active");
          }
        });
      }
      /**
       * 只有keydown里可以阻止内容输入
       * @param {JQuery.KeyDownEvent} e
       */
      function handleEditorKeyDown(e) {
        // 只有当下拉显示时才拦截特殊按键
        if ($dropdown.hasClass("none")) {
          return; // 下拉未显示，交给默认行为
        }

        switch (e.key) {
          case "ArrowUp":
          case "ArrowDown":
          case "Escape":
            e.preventDefault(); // 阻止滚动等默认行为
            break;

          case "Enter":
            e.preventDefault(); // ✅ 关键：在 keydown 阶段阻止换行！
            const items = $dropdown.find("li");
            if (items.length > 0 && selectIndex >= 0) {
              const $li = $(items[selectIndex]);
              getSelectItem($li);
            }
            return; // 提前返回，避免其他处理
        }

        // 如果需要高亮更新，可以在这里或 keyup 中做
        // （通常 ArrowUp/Down 的视觉反馈放在 keyup 更流畅）
      }

      function bindEvents() {
        $editor.on("keyup", handleEditorKey);
        $editor.on("keydown", handleEditorKeyDown);
        $editor.on("input", handleEditorInput);
        // 由于采用的是selection和range API替换内容，需要阻止mouseDown导致的焦点转移
        $dropdown.on("mousedown", "li", function (e) {
          e.preventDefault();
          var $li = $(this);
          getSelectItem($li);
        });

        // 点击外部关闭
        $(document).on("click.dd-" + Date.now(), function () {
          closeList();
        });
      }

      function toggleList() {
        $dropdown.toggleClass("none");
      }

      function openList() {
        $dropdown.removeClass("none");
      }

      function closeList() {
        $dropdown.addClass("none");
      }

      /**
       * 通过鼠标或者键盘enter选中li元素的操作
       * @param {JQuery} $li
       */
      function getSelectItem($li) {
        var value = $li.data("value");
        var text = $li.text();

        // 触发回调
        if (typeof settings.onSelect === "function") {
          settings.onSelect({ value: value, text: text });
        }
        // 通过selection和range API修改聚焦的编辑器内容
        const atIndex = $dropdown.data("at-index");
        replaceSpecialChar(atIndex, text);
        originData += `{${value}}`;
        $editor.data("origin", originData);
        console.log("origin: ", originData);
        $editor.trigger("focus");
        selectIndex = 0;

        closeList();
      }

      // 获取光标位置，用于跟随光标展示下拉列表位置
      function getCursorPosition() {
        const selection = window.getSelection();
        if (!selection) return null;
        /** @type {Range} */
        const range = selection.getRangeAt(0);
        // 收紧到最后
        range.collapse(true);
        const { x: rx, y: ry, height } = range.getBoundingClientRect();
        const { x, y } = $editor[0].getBoundingClientRect();
        return {
          x: rx - x,
          y: ry - y + height,
        };
      }
      // 启动插件
      init();
    });
  };
})(jQuery);
