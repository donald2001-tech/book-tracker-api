require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booksdb",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

app.get("/books", (req, res) => {
    pool.query("SELECT * FROM books", (error, results) => {
        if (error) {
            res.send({ error: error.message });
        } else {
            res.send(results.rows);
        }
});
});

app.post("/books", (req, res) => {
    const { title, author} = req.body;
    pool.query(
       "INSERT INTO books (title, author) VALUES ($1, $2) RETURNING *",
        [title, author],
        (error, results) => {
            if (error) {
                res.send({ error: error.message });
            } else {
                res.send(results.rows[0]);
            }
            }
    );
});

app.put("/books/:id", (req, res) => {
    const id = Number(req.params.id);
    const { title, author } = req.body;

    pool.query(
        "UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING *",
        [title, author, id],
        (error, results) => {
            if (error) {
                res.send({ error: error.message });
            } else if (results.rows.length === 0) {
                res.send({ error: "Book not found" });
            } else {
                res.send(results.rows[0]);
            }
        }
    );
}); 

app.delete("/books/:id", (req, res) => {
    const id = Number(req.params.id);
    pool.query(
        "DELETE FROM books WHERE id = $1 RETURNING *",
        [id],
        (error, results) => {
            if (error) {
                res.send({ error: error.message });
            } else {
                res.send({ message: "Book deleted successfully" });
            }
        }
    );
});

const PORT = 5003;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);  
});