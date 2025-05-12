const { format, min } = require("date-fns");
const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display all of Genres
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();
  res.render("genre_list", {
    title: "Genre List",
    genre_list: allGenres,
  });
});

// Display Page for a specific Genre
exports.genre_detail = asyncHandler(async (req, res, next) => {
  // Get details of Genres and all associated books(in pararellel)
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }).exec(),
  ]);
  if (genre === null) {
    //No results
    const err = new Error("Genre not found");
    err.status = 400;
    return next(err);
  }
  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    genre_books: booksInGenre,
  });
});

// Display Genre create form on GET
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      console.log(errors.array());
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (genreExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(genre.url);
      }
    }
  }),
];

exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec(); // ✅ use findById, not name

  if (genre === null) {
    return res.redirect("/catalog/genres"); // ✅ make sure to return
  }

  res.render("genre_delete", {
    title: "Delete Genre",
    genre: genre,
  });
});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const genreId = req.body.genreid;

  // 🔍 Check if any books are associated with this genre
  const booksInGenre = await Book.find({ genre: genreId }).exec();

  if (booksInGenre.length > 0) {
    // Cannot delete — books still reference this genre
    const genre = await Genre.findById(genreId).exec();
    return res.render("genre_delete", {
      title: "Delete Genre",
      genre: genre,
      books_in_genre: booksInGenre,
      error:
        "You must delete all books in this genre before deleting the genre.",
    });
  }

  // ✅ No books — safe to delete
  await Genre.findByIdAndDelete(genreId).exec();
  res.redirect("/catalog/genres");
});


// Display genre update form on GET
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre == null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_form", {
    title: "Update Genre",
    genre: genre,
  });
});

// Handle genre update on POST
exports.genre_update_post = [
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id, // Required or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Update Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, {});
      res.redirect(updatedGenre.url);
    }
  }),
];
