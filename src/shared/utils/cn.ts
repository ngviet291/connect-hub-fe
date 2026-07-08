//Classname gộp nhiều CSS class lại thành 1 chuỗi, tự động bỏ qua các giá trị falsy (false, null, undefined).
export const cn = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');
