$(function () {
    /** @type {JQuery} */
    const $list = $("#list");
    /** @type {JQuery<HTMLTemplateElement>} */
    const $template = $("#item-template");
    // 为列表设置列表渲染数据
    $list.data("prize-list", /** @type {Array<Prize>} */[]);

    // 通过事件委托统一为列表项的添加和删除按钮添加事件
    $list.on("click", ".add-btn", function (e) {
      // DOM插入新列表项
      const targetItem = $(e.target).closest(".item");
      const clone = document.importNode($template[0].content, true);
      const $clone = $(clone); // 转为jquery对象
      $clone.insertAfter(targetItem);

      // 更新列表数据
      /** @type {Array<Prize>} **/
      const prizeList = $list.data("prize-list");
      const targetIdx = $("#list .item").index(targetItem);
      const newPrizeList = prizeList
        .slice(0, targetIdx + 1)
        .concat([{}])
        .concat(prizeList.slice(targetIdx + 1));
      $list.data("prize-list", newPrizeList);
    });

    $list.on("click", ".remove-btn", function (e) {
      /** @type {Array} **/
      const prizeListData = $list.data("prize-list");
      if (prizeListData.length <= 1) {
        alert("最少保持一项");
        return;
      }
      // 找到最近的复合要求的数据然后
      const targetItem = $(e.target).closest(".item");
      const targetIdx = $("#list .item").index(targetItem);
      if (targetIdx == -1) return;
      targetItem.remove();
      // 清除列表数据下的prizelist对应索引数据

      /** @type {Array} **/
      const newPrizeList = prizeListData
        .slice(0, targetIdx)
        .concat(prizeListData.slice(targetIdx + 1));
      $list.data("prize-list", newPrizeList);
    });

    // 统一的输入处理函数
    $("#list").on("input", ".name-input, .email-input", function (e) {
      const inputItem = $(e.target);
      let attrName = inputItem.hasClass("name-input") ? "name" : "email";
      const targetItem = inputItem.closest(".item");
      const targetIdx = $("#list .item").index(targetItem);
      if (targetIdx === -1) {
        console.error("cannot find idx");
        return;
      }
      const input_val = $(e.target).val();
      // 校验错误
      let error = "";
      if (attrName == "name" && !InputValidator.nameCheck(input_val)) {
        error += "姓名不能有特殊字符";
      }
      if (attrName == "email" && !InputValidator.emailCheck(input_val)) {
        error += "邮箱格式错误";
      }
      const $error = targetItem.find(".error");
      if (error !== "") {
        $error.toggleClass("none", false).text(error);
        return;
      } else {
        $error.toggleClass("none", true);
      }
      // 更新列表整体数据
      const prizelist = $list.data("prize-list");
      const prizeItemData = prizelist[targetIdx] || {};
      prizeItemData[attrName] = input_val;
      prizelist[targetIdx] = prizeItemData;
      $list.data("prize-list", prizelist);
    });
    // 当用户退出编辑输入失去焦点的时候检查输入
    $("#list").on('focusout', ".name-input, .email-input", function (e) {
        checkListInput($list);
    });
    // 输出console data数据
    $("#consoleBtn").on("click", function () {
      console.log($("#list").data("prize-list"));
    });

    // 执行初始化流程
    initialList($list, $template);
  });