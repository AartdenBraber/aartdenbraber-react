export const getCustomPropertyColorHex = (customPropertyName: string) => {
  // Create a new div element
  const div = document.createElement("div");

  // Assign the CSS custom property to the div element
  div.style.cssText = `background-color: var(${customPropertyName});`;

  // Append the div to the body
  document.body.appendChild(div);

  // Fetch the computed background color
  const color = getComputedStyle(div).backgroundColor;

  // Remove the div from the body after fetching the color
  document.body.removeChild(div);

  return color;
};
