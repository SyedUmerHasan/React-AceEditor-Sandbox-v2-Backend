const express = require("express");
const app = express();
var cors = require("cors");
const { NodeVM } = require("vm2");
// Add headers
app.use(cors());

app.all('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});


app.get("/", async function (req, res) {
  let UserString = await req.query.code;
  if (UserString.includes("<script>")) {
    console.log("Foiund a sxcipt tag");

    res.json({
      status: "fail", // success, error
      payload: {
        message: "Script tag not allowed"
      }
    });
  } else {
    const vm = new NodeVM({
      sandbox: {
        Return(data) {
          console.log("Data:", data);
        },
        x: 10,
        y: 20
      },
      require: {
        external: true,
        builtin: [
          "azure-arm-keyvault"
        ],
        root: "./",
        mock: {
          fs: {
            readFileSync() {
              return "Nice try!";
            }
          }
        }
      }
    });
    try {
      vm.run(req.query.code);
    } catch (error) {
      console.log("error: ", error);
    }

    res.json({
      status: "success", // success, error
      payload: {
        message: "Umer is here"
      }
    });
  }
});
app.listen(8080);

// const {NodeVM} = require('vm2');

// const vm = new NodeVM({
//     console: 'inherit',
//     sandbox: {},
//     require: {
//         external: true,
//         builtin: ['fs', 'path'],
//         root: "./",
//         mock: {
//             fs: {
//                 readFileSync() { return 'Nice try!'; }
//             }
//         }
//     }
// });

// // Sync

// let functionInSandbox = vm.run(" require('path'); module.exports = function(who) { console.log('hello '+ who); console.log('I am umer hasan');  }");
// functionInSandbox('world');

// // Async

// let functionWithCallbackInSandbox = vm.run("module.exports = function(who, callback) { callback('hello '+ who); }");
// functionWithCallbackInSandbox('world', (greeting) => {
//     console.log(greeting);
// });
