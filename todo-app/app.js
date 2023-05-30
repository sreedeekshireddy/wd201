/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const express = require("express");
var csrf = require("tiny-csrf");
const app = express();
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const path = require("path");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const flash = require("connect-flash");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

const saltRounds = 10;

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

// Set EJS as view engine
app.set("view engine", "ejs");
// eslint-disable-next-line no-undef
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(flash());

app.use(
  session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, //24hrs
    },
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(async function (request, response, next) {
  response.locals.messages = request.flash();
  // response.locals.errorMsg = request.flash('error')
  // response.locals.error_msg = request.flash('error_msg')
  next();
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({ where: { email: username } })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        })
        .catch((error) => {
          return done(null, false, { message: "Invalid E-mail or Password" });
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.get("/", async function (request, response) {
  try {
    if (request.user) {
      return response.redirect("/todos");
    } else {
      response.render("index", {
        title: "Todo application",
        csrfToken: request.csrfToken(),
      });
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const loggedInUser = request.user.id;
      const overdue = await Todo.overdue(loggedInUser);
      const dueToday = await Todo.dueToday(loggedInUser);
      const dueLater = await Todo.dueLater(loggedInUser);
      const completedList = await Todo.completedItems(loggedInUser);
      const allTodos = await Todo.getTodoList();
      if (request.accepts("html")) {
        response.render("todos", {
          loggedInUser: request.user,
          title: "Todo application",
          allTodos,
          overdue,
          dueToday,
          dueLater,
          completedList,
          csrfToken: request.csrfToken(),
        });
      } else {
        response.json({
          overdue,
          dueToday,
          dueLater,
          completedList,
          allTodos,
        });
      }
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.get("/signup", (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.post("/users", async (request, response) => {
  if (
    request.body.firstName.length == 0 &&
    request.body.email.length == 0 &&
    request.body.password.length == 0
  ) {
    request.flash("error", "First Name can not be Empty");
    request.flash("error", "Email can not be Empty");
    request.flash("error", "Password can not be Empty");
    return response.redirect("/signup");
  }
  if (
    request.body.firstName.length == 0 &&
    request.body.email.length == 0 &&
    request.body.password.length != 0
  ) {
    request.flash("error", "Email can not be Empty");
    request.flash("error", "First Name can not be Empty");
    return response.redirect("/signup");
  }
  if (
    request.body.firstName.length == 0 &&
    request.body.email.length != 0 &&
    request.body.password.length == 0
  ) {
    request.flash("error", "First Name can not be Empty");
    request.flash("error", "Password can not be Empty");
    return response.redirect("/signup");
  }
  if (
    request.body.firstName.length == 0 &&
    request.body.email.length != 0 &&
    request.body.password.length != 0
  ) {
    request.flash("error", "First Name can not be Empty");
    return response.redirect("/signup");
  }
  if (
    request.body.firstName.length != 0 &&
    request.body.email.length == 0 &&
    request.body.password.length == 0
  ) {
    request.flash("error", "Email can not be Empty");
    request.flash("error", "Password can not be Empty");
    return response.redirect("/signup");
  }
  if (
    request.body.firstName.length != 0 &&
    request.body.email.length == 0 &&
    request.body.password.length != 0
  ) {
    request.flash("error", "Email can not be Empty");
    return response.redirect("/signup");
  }
  if (
    request.body.firstName.length != 0 &&
    request.body.email.length != 0 &&
    request.body.password.length == 0
  ) {
    request.flash("error", "Password can not be Empty");
    return response.redirect("/signup");
  }
  //Hash password using bcrypt
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  //Have to create the user here
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        request.flash("success", "Sign Up successful");
      }
      response.redirect("/todos");
    });
  } catch (error) {
    console.log(error);
    request.flash("error", "Account Already exists");
    response.redirect("/signup");
    return response.status(422).json(error);
  }
});

app.get("/homepage", (request, response, next) => {
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.get("/login", async (request, response) => {
  if (request.isAuthenticated()) {
    return response.redirect("/todos");
  }
  response.render("login", {
    title: "Login",
    csrfToken: request.csrfToken(),
  });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (request, response) => {
    console.log(request.user);
    response.redirect("/todos");
  }
);

app.get("/signout", (request, response, next) => {
  //Signout
  request.logout((err) => {
    if (err) {
      return next(err);
    }
    response.redirect("/");
  });
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("Creating a todo", request.body);
    try {
      const todo = await Todo.addTodo({
        title: request.body.title,
        dueDate: request.body.dueDate,
        userId: request.user.id,
      });
      return response.redirect("/todos");
    } catch (error) {
      console.log(error);
      if (error.name == "SequelizeValidationError") {
        const errorMsg = error.errors.map((error) => error.message);
        console.log(errorMsg);
        errorMsg.forEach((message) => {
          if (message == "Validation len on title failed") {
            request.flash(
              "error",
              "Item failed to create as Todo can not be less than 5 characters"
            );
          }
          if (message == "Validation isDate on dueDate failed") {
            request.flash(
              "error",
              "Item failed to create as Date can not be empty"
            );
          }
        });
        response.redirect("/todos");
      } else {
        console.log(error);
        return response.status(422).json(error);
      }
    }
  }
);

app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    try {
      const todo = await Todo.findByPk(request.params.id);
      const updatedTodo = await todo.setCompletionStatus(
        request.body.completed
      );
      return response.json(updatedTodo);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  }
);

app.delete(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  async function (request, response) {
    console.log("We have to delete a Todo with ID: ", request.params.id);

    try {
      await Todo.remove(request.params.id, request.user.id);
      return response.json({ success: true });
    } catch (error) {
      return response.status(422).json(error);
    }
  }
);
module.exports = app;