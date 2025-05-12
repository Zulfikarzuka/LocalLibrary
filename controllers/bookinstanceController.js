const { body, validationResult } = require("express-validator");
const { format: formatDate } = require("date-fns");
const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const asyncHandler = require("express-async-handler");
const bookinstance = require("../models/bookinstance");

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();

  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookinstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookinstance == null) {
    const err = new Error("Book copy not found");
    err.status = 404;
    return next(err);
  }

  let due_back_formatted = "N/A";
  if (bookinstance.due_back instanceof Date && !isNaN(bookinstance.due_back)) {
    due_back_formatted = formatDate(bookinstance.due_back, "MMM do, yyyy");
  }

  res.render("bookinstance_detail", {
    title: "Book:",
    bookinstance,
    due_back_formatted,
  });
});

//Display BookInctance create form on GET
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  res.render("bookinstance_form", {
    title: "BookInstance Create",
    book_list: allBooks,
  });
});

// // Handle BookInstance create on POST.
// exports.bookinstance_create_post = [
//   // Validate and sanitize fields.
//   body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
//   body("imprint", "Imprint must be specified")
//     .trim()
//     .isLength({ min: 1 })
//     .escape(),
//   body("status").escape(),
//   body("due_back", "Invalid date")
//     .optional({ values: "falsy" })
//     .isISO8601()
//     .toDate(),

//   // Process request after validation and sanitization.
//   asyncHandler(async (req, res, next) => {
//     // Extract the validation errors from a request.
//     const errors = validationResult(req);

//     // Create a BookInstance object with escaped and trimmed data.
//     const bookInstance = new BookInstance({
//       book: req.body.book,
//       imprint: req.body.imprint,
//       status: req.body.status,
//       due_back: req.body.due_back,
//     });

//     if (!errors.isEmpty()) {
//       // There are errors.
//       // Render form again with sanitized values and error messages.
//       const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

//       res.render("bookinstance_form", {
//         title: "Create BookInstance",
//         book_list: allBooks,
//         selected_book: bookInstance.book._id,
//         errors: errors.array(),
//         bookinstance: bookInstance,
//       });
//       return;
//     } else {
//       // Data from form is valid
//       await bookInstance.save();
//       res.redirect(bookInstance.url);
//     }
//   }),
// ];

exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back").optional({ values: "falsy" }).isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
      return res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        book_selected: bookinstance.book._id,
        errors: errors.array(),
        bookinstance,
      });
    }

    // ❗ Prevent duplicate BookInstance for same Book
    const existingInstance = await BookInstance.findOne({
      book: req.body.book,
    }).exec();

    if (existingInstance) {
      const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
      return res.render("bookinstance_form", {
        title: "Create BookInstance",
        book_list: allBooks,
        book_selected: bookinstance.book._id,
        bookinstance,
        errors: [
          {
            msg: "A BookInstance already exists for this book. Only one instance per book is allowed.",
          },
        ],
      });
    }

    // ✅ Save if valid and not duplicate
    await bookinstance.save();
    res.redirect(bookinstance.url);
  }),
];

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance === null) {
    return res.redirect("/catalog/bookinstances");
  }

  res.render("bookinstance_delete", {
    title: "Delete BookInstance",
    bookinstance: bookInstance,
  });
});

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid).exec();
  res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookInstance, books] = await Promise.all([
    BookInstance.findById(req.params.id).exec(),
    Book.find({}, "title").sort({ title: 1 }).exec(),
  ]);

  if (bookInstance === null) {
    const err = new Error("BookInstance not found");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_form", {
    title: "Update BookInstance",
    book_list: books,
    bookinstance: bookInstance,
  });
});

// Handle BookInstance update on POST
exports.bookinstance_update_post = [
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back").optional({ values: "falsy" }).isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const updatedInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id, // Required or a new ID will be assigned
    });

    if (!errors.isEmpty()) {
      const books = await Book.find({}, "title").sort({ title: 1 }).exec();
      return res.render("bookinstance_form", {
        title: "Update BookInstance",
        book_list: books,
        bookinstance: updatedInstance,
        errors: errors.array(),
      });
    }

    // Update record
    await BookInstance.findByIdAndUpdate(req.params.id, updatedInstance);
    res.redirect(updatedInstance.url);
  }),
];
