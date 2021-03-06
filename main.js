const fs = require("fs");
const empty = "0";
//Получить массив обьектов в переменную data.
//Чтение сsv файла синхронно с указаным разделителем ","
const data = fs
  .readFileSync("acme_worksheet.csv")
  .toString()
  .split("\n")
  .map((e) => e.trim())
  .map((e) => e.split(",").map((e) => e.trim()));
// Определение столбцов
const columns = data.shift();
const columnName = columns.findIndex((v) => /Name/i.test(v));
const columnDate = columns.findIndex((v) => /Date/i.test(v));
const columnWork = columns.findIndex((v) => /Work/i.test(v));
// Сортировка дат.
const A = data  
  .reduce((a, v) => {
    const date = new Date(v[columnDate]).valueOf();
    a.includes(date) || a.push(date);
    return a;
  }, [])
  .sort();
// Разбор данных для сопоставления
const employees = data.reduce((a, v) => {
  const name = v[columnName].trim().replace(/\s+/g, " ");
  const date = new Date(v[columnDate]).valueOf();
  const work = v[columnWork].trim();
  // Сопоставить столбцы c помощью регулярных выражений, заполняем 0 для тех дат, когда сотрудник отсутствует.
  let nw = [...a.entries()].find(([re]) => re.test(name));
  if (!nw) { 
    nw = [null, { name, work: new Array(A.length).fill(empty) }];
    a.set(new RegExp(name, "i"), nw[1]);
  }
  nw[1].work[A.indexOf(date)] = work;
  return a;
}, new Map());
// Возвращается сопоставленная таблица по всем сотрудникам.
const result = [...employees.entries()].map(([_, { name, work }]) => [
  name,
  ...work,
]);
// А так же и заголовки.
result.unshift([
  "Name/Date",
  ...A.map((d) => new Date(d).toISOString().slice(0, 10)),
]);
result.map((v) => console.log(v.join(", ")));
// Записать данные в csv file с помощю функции.
fs.writeFile("./data.csv", result.join("\r\n"), (err) => {
    console.log(err || "done");
});
