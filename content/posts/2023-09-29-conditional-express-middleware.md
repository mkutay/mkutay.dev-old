---
title: Conditional Express middleware
description: How do you skip some middleware on Tuesdays?
date: 2023-09-29
url: /conditional-express-middleware
---

_This post is written for people familiar with Express.js. It was last updated for Express version 4.18.2._

Often, you want to use Express middleware for every request. For example, you want to log every time someone hits your server.

But other times, you want to run some middleware conditionally. Maybe you only want certain routes to be authenticated, or maybe you want different options sometimes, or maybe you want to have special behavior on Tuesdays.

Let's see the various ways to do that.

## Conditionally skip middleware by route

Often, you only want to run some middleware for certain routes.

Express lets you include more than one handler when defining a route, so you can just do that for a particular route.

For example, let's say you only want to use the logging middleware for the `/home` route. You can do something like this:

```js
// When a user makes a GET request to /home,
// use the logger and then use our request handler.
app.get("/home", logger(), (req, res) => {
  // ...
});
```

You can also do something like this:

```js
// When a user makes a GET request to /home,
// use the logger...
app.get("/home", logger());

// ...and then use our request handler.
app.get("/home", (req, res) => {
  // ...
});
```

If you're doing this for multiple routes, you might want to store the middleware function in a variable so you can use it in multiple places. For example, here's how you'd use the logger for `/home` and `/about`:

```js
// Store the logger in a variable for reuse.
const loggingMiddleware = logger();

// Use the logger for GET /home.
app.get("/home", loggingMiddleware, (req, res) => {
  // ...
});

// Use the logger for GET /about.
app.get("/about", loggingMiddleware, (req, res) => {
  // ...
});
```

You can also use a [router], which functions like a mini-app, to achieve similar goals.

For example, let's say you only want to use the logging middleware for `/api` routes. You can do something like this:

```js
// Create a router.
const apiRouter = express.Router();

// Add logging middleware to the API router.
apiRouter.use(logger());

// Define an API route (this is just a sample).
apiRouter.get("/pumpkins", (req, res) => {
  // ...
});

// Mount the router to the main app at /api.
app.use("/api", apiRouter);
```

## Conditionally skip middleware by some condition

To skip some middleware conditionally, create your own middleware function that conditionally calls the middleware function at hand.

For example, let's say you want to skip logging if the user sets the `no_log` query parameter.

```js
// Set up the logging middleware.
const loggingMiddleware = logger();

app.use((req, res, next) => {
  if (Object.hasOwn(req.query, "no_log")) {
    // If we don't want to log, move on.
    next();
  } else {
    // Otherwise, call the logging middleware.
    loggingMiddleware(req, res, next);
  }
});
```

Because this is just code, you don't have to depend on the request or response. For example, here's how you skip logging on Tuesdays:

```js
app.use((req, res, next) => {
  const isTuesday = new Date().getDay() === 2;
  if (isTuesday) {
    // If we don't want to log, move on.
    next();
  } else {
    // Otherwise, call the logging middleware.
    loggingMiddleware(req, res, next);
  }
});
```

This takes advantage of the fact that Express middlewares are just functions that you can call.

## Conditionally change options

Sometimes you want to use middleware, but you want to use it differently in certain cases.

For example, let's say that you want to attach the current user as extra data in your logging middleware. Here's how you might do that:

```js
app.use((req, res, next) => {
  let loggingMiddleware;
  if (res.locals.user) {
    const { username } = res.locals.user;
    loggingMiddleware = logger(
      () => `incoming request from ${username}`
    );
  } else {
    loggingMiddleware = logger("incoming request from anonymous user");
  }
  loggingMiddleware(req, res, next);
});
```

Again, this takes advantage of the fact that these are just functions that you can call like any other.

If you want to learn more, I wrote [a blog post explaining the fundamentals of Express]({{< relref "posts/2014-03-05-understanding-express" >}}).

[router]: https://expressjs.com/en/4x/api.html#router
