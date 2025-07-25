import { ThemeEnum } from "./theme";

export const getSplotchContrastColor = (splotchName: string) => {
  return splotchName.includes("light") ? ThemeEnum.LIGHT : ThemeEnum.DARK;
};
