'use strict';
const {
  Model,Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }

    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      const overdueTasks = await Todo.overdue();
      overdueTasks.forEach(task => console.log(task.displayableString()));
      console.log("\n");

      console.log("Due Today");
      const dueTodayTasks = await Todo.dueToday();
      dueTodayTasks.forEach(task => console.log(task.displayableString()));
      console.log("\n");

      console.log("Due Later");
      const dueLaterTasks = await Todo.dueLater();
      dueLaterTasks.forEach(task => console.log(task.displayableString()));
    }

    static async overdue() {
      // Find all incomplete tasks that have a due date in the past
      const currentDate = new Date();
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: currentDate.toISOString().slice(0,10)
          },
          completed: false,
        }
      });
    }
  

    static async dueToday() {
      // Find all incomplete tasks that have a due date of today
      const currentDate = new Date();
      return await Todo.findAll({
        where: {
          completed: false,
          dueDate: currentDate.toISOString().slice(0,10)
        }
      });
    }

    static async dueLater() {
      // Find all incomplete tasks that have a due date in the future
      const currentDate = new Date();
      return await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: currentDate.toISOString().slice(0,10)
          },
          completed: false,
        }
      });
    }

    static async markAsComplete(id) {
      // Find the task with the specified ID and mark it as complete
      return await Todo.update({completed:true},{
          where:{
            id:id
          }
        }
      );
    }

    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      const day=new Date(this.dueDate);
      return day.getDate()===new Date().getDate() ? `${this.id}. ${checkbox} ${this.title}`.trim():`${this.id}. ${checkbox} ${this.title} ${this.dueDate}`.trim;
    }
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};

