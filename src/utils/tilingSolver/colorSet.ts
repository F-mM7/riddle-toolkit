/** n 個のピースに色相を均等に割り当てた色を返す */
export const colorSet = (n: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < n; i++) {
    colors.push(`hsl(${(i * 360) / n}, 100%, 66%)`);
  }
  return colors;
};
