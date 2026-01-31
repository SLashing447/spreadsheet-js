function add(...numbers) {
  setCellTextByPos(numbers.reduce((a, b) => a + b, 0));
}
