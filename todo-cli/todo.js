const todoList = () => {
  let all = []
  const add = (todoItem) => {
    all.push(todoItem)
  }
  const markAsComplete = (index) => {
    all[index].completed = true
  }

  const overdue = () => {
    return all.filter(
      (x) =>
        x.dueDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    );
  }
  const dueToday=() =>{
    return all.filter(
      (x) => x.dueDate === new Date().toISOString().slice(0, 10)
    );
  }
  const dueLater=() =>{
    return all.filter(
      (x) =>x.dueDate === new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    );
  }
  const toDisplayableList = (list) => {
      return list
      .map(
        (todo) =>
          `${todo.completed ? "[x]" : "[ ]"} ${todo.title} ${
            todo.dueDate ==  new Date().toISOString().slice(0,10) ? "" : todo.dueDate
          }`
      )
      .join("\n");
  }
  return {
    all,
    add,
    markAsComplete,
    overdue,
    dueToday,
    dueLater,
    toDisplayableList,
  };
};

module.exports = todoList;