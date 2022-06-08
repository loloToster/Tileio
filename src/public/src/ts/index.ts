import "gridstack/dist/gridstack.min.css";
import { GridStack } from "gridstack";
import "gridstack/dist/jq/gridstack-dd-jqueryui";

console.log("test")

var grid = GridStack.init()
grid.addWidget({ w: 2, content: "item 1" })

document.addEventListener("ready", () => {
    console.log("ready")
})
