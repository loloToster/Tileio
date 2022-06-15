const { merge } = require("webpack-merge")
const common = require("./webpack.common")

// compile typescript
module.exports = merge(common, {
    mode: "development",
    devtool: false,
    watch: true
})
