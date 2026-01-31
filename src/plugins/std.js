function add(...numbers) {
  setCellTextByPos(numbers.reduce((a, b) => a + b, 0));
}
function area() {
  const c_area = (arr) => {
    return (arr.row2 - arr.row1 + 1) * (1 + arr.col2 - arr.col1);
  };
  let cell = api.cell;
  console.log(cell);
  watch().area((ar) => setCellTextByPos(c_area(ar), cell));
}
function key() {
  let cell = api.cell;

  watch().key((k) => setCellTextByPos(k.key, cell));
}

const hello = () => alert("hello");
