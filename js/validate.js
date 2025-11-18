class InputValidator {
  static nameCheck(input) {
    const reg = /^[a-zA-Z0-9\u4e00-\u9fa5\s_-]*$/;
    return reg.test(input);
  }

  static emailCheck(input) {
    const reg = /^[^@]+@[^@]+$/;
    return reg.test(input);
  }
}
