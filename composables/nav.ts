export const useNav = () => {
  return useState(() => ({
    isVerticalNavVisible: true,
    isDrawerNavVisible: false,
  }));
};
