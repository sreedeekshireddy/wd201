const Sequelize = require("sequelize");

const database = "todo_db";
const username = "postgres";
const password = "Deekshi*02";
const sequelize = new Sequelize(database, username, password, {
  host: "localhost",
  dialect: "postgres",
  logging:false,
});

const connect = async () => {
  return sequelize.authenticate();
}

module.exports = {
  connect,
  sequelize
}
