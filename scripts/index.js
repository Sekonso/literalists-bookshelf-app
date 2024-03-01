// Book list
const books = getBooksFromStorage();

// Form input elements
const bookshelfForm = document.querySelector(".bookshelf-form");
const titleInput = document.getElementById("title-input");
const authorInput = document.getElementById("author-input");
const yearInput = document.getElementById("year-input");
const statusInput = document.getElementById("status-input");

// Filter elements
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const statusFilter = document.getElementById("status-filter");

// Booklist elements
const bookshelfList = document.querySelector(".bookshelf-list");

// Popup elements
const popup = document.querySelector(".popup");
const popupDelete = document.querySelector(".popup-delete");
const popupEditForm = document.getElementById("popup-edit-form");
const titleEditInput = document.getElementById("title-edit-input");
const authorEditInput = document.getElementById("author-edit-input");
const yearEditInput = document.getElementById("year-edit-input");
const confirmDeleteButton = document.getElementById("confirmDelete");
const cancelDeleteButton = document.getElementById("cancelDelete");
const confirmEditButton = document.getElementById("confirmEdit");
const cancelEditButton = document.getElementById("cancelEdit");

// DOM event listeners
document.addEventListener("DOMContentLoaded", () => {
  displayBooks(books);
});

bookshelfForm.addEventListener("submit", (e) => {
  try {
    e.preventDefault();
    insertNewBook();
    displayFilteredBooks(books);
  } catch (error) {
    console.error(`Etrror submitting new book: ${error.message}`);
  }
});

searchButton.addEventListener("click", () => {
  displayFilteredBooks(books);
});

searchInput.addEventListener("input", () => {
  displayFilteredBooks(books);
});

statusFilter.addEventListener("change", () => {
  displayFilteredBooks(books);
});

// Menambah buku baru ke array dan storage
function insertNewBook() {
  try {
    const newBook = {
      id: +new Date(),
      title: titleInput.value,
      author: authorInput.value,
      year: yearInput.value,
      isCompleted: statusInput.value === "selesai",
    };

    books.push(newBook);
    setBooksToStorage();
    clearInput();
  } catch (error) {
    console.error(`Error inserting the book: ${error.message}`);
  }
}

// Membersihkan input form
function clearInput() {
  titleInput.value = "";
  authorInput.value = "";
  yearInput.value = "";
  statusInput.value = "belum";
}

// Filter tampilan buku bedasarkan nilai searching dan isCompleted
function filterBook() {
  const searchValue = searchInput.value.toLowerCase();
  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchValue) &&
      checkStatusFilter(book.isCompleted)
  );
}

// Mengecek buku status buku yang sesuai dengan filter
// @return Boolean
function checkStatusFilter(completedBook) {
  const statusFilterValue = statusFilter.value;
  return (
    statusFilterValue === "semua" ||
    (statusFilterValue === "selesai" && completedBook) ||
    (statusFilterValue === "belum" && !completedBook)
  );
}

// Membuat elemen buku
// @returns elementNode
function createBookElement(book) {
  const bookElement = document.createElement("div");
  bookElement.classList.add(
    "bookshelf-book",
    "container-2",
    "bg-light-dark",
    "text-lighter-dark"
  );

  const propertyContainer = document.createElement("div");
  propertyContainer.classList.add("bookshelf-book-property");

  const title = document.createElement("h1");
  title.classList.add("text-large");
  title.textContent = book.title;

  const authorAndYear = document.createElement("p");
  authorAndYear.classList.add("text-small");
  authorAndYear.textContent = `${book.author} - ${book.year}`;

  propertyContainer.append(title, authorAndYear);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("bookshelf-book-buttons");

  const statusToggleButton = document.createElement("button");
  statusToggleButton.classList.add("check", "bg-white", "text-dark");
  statusToggleButton.innerHTML = book.isCompleted
    ? '<i class="fa-solid fa-rotate-left"></i>'
    : '<i class="fa-solid fa-check"></i>';
  statusToggleButton.addEventListener("click", () => toggleBookStatus(book.id));

  const editButton = document.createElement("button");
  editButton.classList.add("check", "bg-white", "text-dark");
  editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
  editButton.addEventListener("click", () => displayPopup(book, "edit"));

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("check", "bg-white", "text-dark");
  deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteButton.addEventListener("click", () => displayPopup(book, "delete"));

  buttonsContainer.append(statusToggleButton, editButton, deleteButton);

  bookElement.append(propertyContainer, buttonsContainer);
  return bookElement;
}

// Menambah elemen buku ke dalam bookshelf-list
function appendBookElement(book) {
  bookshelfList.append(createBookElement(book));
}

// Menampilkan buku
function displayBooks(bookList) {
  try {
    bookshelfList.innerHTML = "";

    if (bookList.length > 0) {
      bookList.forEach((book) => appendBookElement(book));
    } else {
      bookshelfList.innerHTML = `<h1 class="bookshelf-list-empty text-white">Tidak ada buku...</h1>`;
    }
  } catch (error) {
    console.error(`Error displaying the book: ${error.message}`);
  }
}

// Menampilkan buku bedasarkan kriteria search dan status filter
function displayFilteredBooks(unfilteredBooks) {
  const filteredBooks = filterBook(unfilteredBooks);
  displayBooks(filteredBooks);
}

// Mengambil data buku dari local storage
// @returns array of object
function getBooksFromStorage() {
  try {
    if (typeof localStorage === "undefined") {
      window.alert("Local storage is not supported in this browser.");
      throw new Error("LocalStorageNotSupported");
    }

    const storedBooks = localStorage.getItem("books");
    return storedBooks ? JSON.parse(storedBooks) : [];
  } catch (error) {
    console.error(
      `Error retrieving books from local storage: ${error.message}`
    );
    return [];
  }
}

// Menambah data buku dari array ke local storage
function setBooksToStorage() {
  localStorage.setItem("books", JSON.stringify(books));
}

// Menggati nilai isComplete buku bedasarkan id
function toggleBookStatus(id) {
  const index = books.findIndex((book) => book.id === id);
  if (index !== -1) {
    books[index].isCompleted = !books[index].isCompleted;
    setBooksToStorage();
    displayFilteredBooks(books);
  }
}

// Menampilkan container popup
function displayPopup(book, popupOption) {
  if (popupOption === "edit") displayPopupEdit(book);
  if (popupOption === "delete") displayPopupDelete(book);

  // Show the modal
  popup.style.display = "flex";
}

// Menampilkan popup dialog konfirmasi delete
function displayPopupDelete(book) {
  popupDelete.style.display = "block";
  popupEditForm.style.display = "none";

  confirmDeleteButton.addEventListener("click", () => {
    deleteBook(book.id);
    closePopup(popup);
    displayFilteredBooks(books);
  });

  cancelDeleteButton.addEventListener("click", () => {
    closePopup(popup);
  });
}

// Menampilkan popup form edit
function displayPopupEdit(book) {
  popupDelete.style.display = "none";
  popupEditForm.style.display = "block";

  titleEditInput.value = book.title;
  authorEditInput.value = book.author;
  yearEditInput.value = book.year;

  popupEditForm.addEventListener("submit", (e) => {
    e.preventDefault();
    editBook(book.id);
    closePopup(popup);
    displayFilteredBooks(books);
  });

  cancelEditButton.addEventListener("click", () => {
    closePopup(popup);
  });
}

// Menutup container popup
function closePopup(popup) {
  popup.style.display = "none";
}

// Menghapus buku bedasarkan id
function deleteBook(id) {
  const index = books.findIndex((book) => book.id === id);
  if (index !== -1) {
    books.splice(index, 1);
    setBooksToStorage();
  }
}

// Mengedit buku bedasarkan id
function editBook(id) {
  const index = books.findIndex((book) => book.id === id);
  if (index !== -1) {
    const newValue = {
      id: id,
      title: titleEditInput.value,
      author: authorEditInput.value,
      year: yearEditInput.value,
      isCompleted: books[index].isCompleted,
    };

    books[index] = newValue;
    setBooksToStorage();
  }
}
