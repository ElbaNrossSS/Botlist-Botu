module.exports = client => {
    client.on("messageCreate", require("./message"));

};