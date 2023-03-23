const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "goodreads.db");
let db = null;

app.use(express.json()); // for add book api

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    //Assigning a port number
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//Handling HTTP Requests

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  //console.log(booksArray.length);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId", async (request, response) => {
  //console.log(request.params); { bookId: '1' } , { bookId: '2' } so on. bookId changes when path parameter changes

  const { bookId } = request.params;
  //console.log(bookId); 1 , 2 so on

  const getBookQuery = `
    SELECT
        *
    FROM
        book
    WHERE
        book_id = ${bookId};`;

  const book = await db.get(getBookQuery);
  response.send(book);
});

//Add Book API
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  //console.log(dbResponse);
  //output { stmt: Statement { stmt: undefined }, lastID: 41, changes: 1 }
  const bookId = dbResponse.lastID;
  response.send({ bookId: bookId });
});

//Update Book API
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price=${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
});

//Delete Book API
app.delete("/books/:bookId", async (request, response) => {
  const { bookId } = request.params;

  const deleteBookQuery = `
    DELETE FROM
    BOOK
    WHERE book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  response.send(`Book with bookId ${bookId} Deleted Successfully`);
});

//Get Author Books API
app.get("/authors/:authorId/books", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBooksQuery = `
    SELECT 
    *
    FROM
     book
    WHERE 
      author_id = ${authorId}`;

  const authorBooksArray = await db.all(getAuthorBooksQuery);
  response.send(authorBooksArray);
});
