// Initializes the npm packages used
var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

// Initialize the connection sync with a MySQL database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});


// Connecting to our database
connection.connect(function (err) {
  if (err) throw err;
  console.log("connection successful!");
  // running makeTable which will start the app
  makeTable();
});

// makeTable function
function makeTable() {
  // query results are returned as an array of products 
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    console.table(res);
    promptSupervisor();
  });
}


function promptSupervisor() {
  inquirer
  // supervisor choices
    .prompt([{
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: ["View Product Sales by Department", "Create New Department", "Quit"]
    }])
    .then(function (val) {
      // if user clicks "view product sales by department"
      if (val.choice === "View Product Sales by Department") {
        viewSales();
        // if user clicks "creat new department"
      } else if (val.choice === "Create New Department") {
        // adds the new department
        addDepartment();
        // if user clicks quit
      } else {
        console.log("Goodbye!");
        // forces the process to exit
        process.exit(0);
      }
    });
}

// add department function for if user clicks "add department"
function addDepartment() {
  inquirer
    .prompt([{
        type: "input",
        name: "name",
        message: "What is the name of the department?"
      },
      {
        type: "input",
        name: "overhead",
        message: "What is the overhead cost of the department?",
        // returns or sets the value attribute of the selected elements.
        validate: function (val) {
          return val > 0;
        }
      }
    ])
     // creates a new department w/ user info
    .then(function (val) {
      connection.query(
        "INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)", [val.name, val.overhead],
        function (err) {
          if (err) throw err;
          // Alert and runs makeTable
          console.log("ADDED DEPARTMENT!");
          makeTable();
        }
      );
    });
}

// finally if user clicks "view product sales by department"
function viewSales() {
  // Selects a few columns from the departments table, calculates a total_profit column
  connection.query(
    "SELECT departProd.department_id, departProd.department_name, departProd.over_head_costs, SUM(departProd.product_sales) as product_sales, (SUM(departProd.product_sales) - departProd.over_head_costs) as total_profit FROM (SELECT departments.department_id, departments.department_name, departments.over_head_costs, IFNULL(products.product_sales, 0) as product_sales FROM products RIGHT JOIN departments ON products.department_name = departments.department_name) as departProd GROUP BY department_id",
    function (err, res) {
      console.table(res);
      // back to the supervisor choices view
      promptSupervisor();
    }
  );
}