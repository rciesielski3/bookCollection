const bookList = document.getElementById("book-list");
const nextPageButton = document.getElementById("btnNext");
const prevPageButton = document.getElementById("btnPrev");
let currentPage = 1;

async function loadBooks() {
  try {
    const authorFilter = document.getElementById("filter-author").value;
    const sort = document.getElementById("sort").value;
    const sortOrder = document.getElementById("sort-order").value;

    let booksPerPage = document.getElementById("itemsPerPage").value;
    let url = `http://localhost:3000/books?_page=${currentPage}&_limit=${booksPerPage}`;

    if (authorFilter) {
      url += `&author_like=${authorFilter}`;
    }

    if (sort) {
      url += `&_sort=${sort}&_order=${sortOrder}`;
    }

    const response = await fetch(url);
    const books = await response.json();

    displayBooks(books);

    if (books.length < booksPerPage) {
      nextPageButton.disabled = true;
    } else {
      nextPageButton.disabled = false;
    }
    prevPageButton.disabled = currentPage === 1;
  } catch (error) {
    console.error(`Error loading books: ${error}`);
  }
}

function displayBooks(books) {
  bookList.innerHTML = "";
  books.forEach((book) => {
    const li = document.createElement("li");
    const titleText = document.createElement("span");

    titleText.style.color = "white";
    titleText.textContent = book.title;
    titleText.setAttribute("id", `book-${book.id}`);

    const authorYearText = document.createElement("span");
    authorYearText.textContent = ` by ${book.author} (${book.year}) `;

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.setAttribute("book-id", book.id);
    editButton.setAttribute("class", "edit-button");
    editButton.onclick = () => editBookName(book.id);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("class", "delete-button");
    deleteButton.onclick = () => deleteBook(book.id);

    li.appendChild(titleText);
    li.appendChild(authorYearText);
    li.appendChild(editButton);
    li.appendChild(deleteButton);
    bookList.appendChild(li);
  });

  document.getElementById("page-info").textContent = `Page ${currentPage}`;
}

async function updateBookTitle(bookId, newName) {
  try {
    await fetch(`http://localhost:3000/books/${bookId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newName }),
    });
  } catch (error) {
    console.error(`Error updating book: ${error}`);
  }
}

async function editBookName(bookId) {
  try {
    const nameElement = document.getElementById(`book-${bookId}`);
    const editButton = document.querySelector(
      `.edit-button[book-id="${bookId}"]`
    );

    titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = nameElement.textContent;

    const textWidth = nameElement.offsetWidth;
    titleInput.style.width = `${textWidth}px`;

    nameElement.parentNode.insertBefore(titleInput, nameElement);

    nameElement.textContent = "";
    editButton.style.display = "none";

    const updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.setAttribute("class", "update-button");
    updateButton.onclick = async function () {
      try {
        const newName = titleInput.value;

        await updateBookTitle(bookId, newName);

        nameElement.textContent = newName;
        nameElement.style.display = "inline";
        editButton.style.display = "inline";

        titleInput.remove();
        updateButton.remove();
      } catch (error) {
        console.error(`Error updating book: ${error}`);
      }
    };
    nameElement.parentNode.insertBefore(updateButton, editButton);
  } catch (error) {
    console.error(`Error loading book details: ${error}`);
  }
}

async function addBook() {
  try {
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const year = document.getElementById("year").value;

    await fetch("http://localhost:3000/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, author, year }),
    });

    await loadBooks();
  } catch (error) {
    console.error(`Error loading books: ${error}`);
  }
}

async function deleteBook(id) {
  try {
    await fetch(`http://localhost:3000/books/${id}`, {
      method: "DELETE",
    });

    await loadBooks();
  } catch (error) {
    console.error(`Error loading books: ${error}`);
  }
}

function nextPage() {
  currentPage++;
  loadBooks();
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadBooks();
  }
}

document.addEventListener("DOMContentLoaded", loadBooks);
