
//resize.js部分
export const resize = ({
  designWidth = 750,
} = {}) => {
  const changeView = () => {
    let width =
      document.body.clientWidth || document.documentElement.clientWidth,
      height =
        document.body.clientHeight || document.documentElement.clientHeight;
    if (width > 750) width = 750;
    document
      .getElementsByTagName("html")[0]
      .style.setProperty("font-size", (100 * width) / designWidth + "px");
    if (!width) {
      setTimeout(changeView, 20);
    }
  };
  changeView();
}
