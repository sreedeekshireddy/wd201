const todoList=require("../todo");
const { all, markAsComplete, add, overdue, dueToday, dueLater, toDisplayableList}=todoList();
describe("Todolist Test Suite",()=>{
    beforeAll(()=>{
        add({
            title:"Today task",
            completed:false,
            dueDate:new Date().toISOString().slice(0,10),
        });
        add({
            title:"Yesterday task",
            completed:false,
            dueDate:new Date(Date.now() - 86400000).toISOString().slice(0,10),
        });
        add({
            title:"Tomorrow task",
            completed:false,
            dueDate:new Date(Date.now() + 86400000).toISOString().slice(0,10),
        });
    });
    test("Should add new todo",()=>{
        const todoItemsCount=all.length;
        add({
            title:"Test todo 1",
            completed:false,
            dueDate:new Date().toISOString().slice(0,10),
        });
        expect(all.length).toBe(todoItemsCount+1);
    });
    test("should mark a todo as complete",()=>{
        expect(all[0].completed).toBe(false);
        markAsComplete(0);
        expect(all[0].completed).toBe(true);
    });
    test("Checks retrival of overdueitems",()=>{
        const a = overdue().length;
        add({
            title:"Test todo 2",
            completed:false,
            dueDate:new Date(Date.now() - 86400000).toISOString().slice(0, 10),
        });
        expect(overdue().length).toBe(a + 1);
    });
    test("Checks retrival of due today items",()=>{
        const b = dueToday().length;
        add({
            title:"Test todo 3",
            completed:false,
            dueDate:new Date().toISOString().slice(0, 10),
        });
        expect(dueToday().length).toBe(b + 1);
    });
    test("Checks retrival of dueLater items",()=>{
        const c = dueLater().length;
        add({
            title:"Test todo 4",
            completed:false,
            dueDate:new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        });
        expect(dueLater().length).toBe(c + 1);
    });
});