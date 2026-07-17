window.addEventListener("load", () => {
  const element = document.getElementById("tel-placeholder");

  if (element) {
    element.innerHTML = "+1 (" + (424*2) + ") " + (206*2) + "-0" + (341*2);
    element.setAttribute("href", "tel:+1" + (424*2) + "" + (206*2) + "0" + (341*2))
  }
});
