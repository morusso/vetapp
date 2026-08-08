const DOT_COLORS = ["#4c8c6b", "#b08a3c", "#6b7fc4", "#a8618c", "#4c9bb0", "#8a7bc4"];

export function dotColor(id: number) {
  return DOT_COLORS[id % DOT_COLORS.length];
}
