const books = [];
const BOOK_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

// Listener DOM
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBookList();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// function menambahkan data buku
function addBookList() {
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookIsComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    bookIsComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(BOOK_EVENT));
  saveData();
}

// buat random ID dari timestamp input user
function generateId() {
  return +new Date();
}

// function untuk return object buku
function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

// Listener BOOK_EVENT
document.addEventListener(BOOK_EVENT, function () {
  // ambil id incomplete ke variabel uncompletedbooklist
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBookList.innerHTML = "";

  // ambil id complete ke variabel completedbooklist
  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  const bookList = document.getElementById("searchedBookList");
  bookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeUncompletedBook(bookItem);
    if (!bookItem.isCompleted) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
  for (const bookitem2 of books) {
    const bookListElement = displayBookList(bookitem2);
    bookList.append(bookListElement);
  }
});

//  untuk menampilkan buku yang dicari oleh input user
function displayBookList(bookObject) {
  const textListTitle = document.createElement("h2");
  textListTitle.innerText = bookObject.title;

  const textListAuthor = document.createElement("p");
  textListAuthor.innerText = "Penulis : " + bookObject.author;

  const textListYear = document.createElement("p");
  textListYear.innerText = "Tahun     : " + bookObject.year;

  const listContainer = document.createElement("div");
  listContainer.classList.add("inner");
  listContainer.append(textListTitle, textListAuthor, textListYear);

  const container2 = document.createElement("div");
  container2.classList.add("item", "shadow");
  container2.append(listContainer);
  container2.setAttribute("id", "book-${bookObject.id");
  container2.classList.add("hide");

  //   Tampilkan container jika input cari buku = judul buku tersedia
  const searchButton = document.getElementById("searchSubmit");
  const bookTitleValue = capitalizeFirstLetter(bookObject.title);
  searchButton.addEventListener("click", function (searchevent) {
    const searchBar = document.getElementById("searchBookTitle").value;
    const searchBarString = capitalizeFirstLetter(searchBar);
    searchevent.preventDefault();
    if (searchBarString != bookTitleValue) {
      container2.classList.add("hide");
    } else {
      container2.classList.remove("hide");
    }
  });

  return container2;
}

// Function capitalize huruf pertama untuk error handling
function capitalizeFirstLetter(inputString) {
  const firstLetter = inputString.charAt(0).toUpperCase();

  // Ambil sisa huruf dari string tanpa huruf pertama
  const restOfString = inputString.slice(1);

  // Gabungkan huruf pertama yang sudah diubah dengan sisa string
  const capitalizedString = firstLetter + restOfString;

  return capitalizedString;
}

// Menampilkan item book list uncompleted
function makeUncompletedBook(bookObject) {
  const textTitle = document.createElement("h2");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = "Penulis : " + bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = "Tahun     : " + bookObject.year;

  const uncompletedContainer = document.createElement("div");
  uncompletedContainer.classList.add("inner");
  uncompletedContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(uncompletedContainer);
  container.setAttribute("id", "book-${bookObject.id");

  if (bookObject.isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    const undoText = document.createElement("p");
    undoText.classList.add("undo-text");
    undoText.innerText = "Belum selesai dibaca";
    undoButton.append(undoText);
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    const trashText = document.createElement("p");
    trashText.classList.add("trash-text");
    trashText.innerText = "Hapus buku";
    trashButton.append(trashText);
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });
    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");

    const checkText = document.createElement("p");
    checkText.classList.add("check-text");
    checkText.innerText = "Selesai dibaca";
    checkButton.append(checkText);

    checkButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    const trashText = document.createElement("p");
    trashText.classList.add("trash-text");
    trashText.innerText = "Hapus buku";
    trashButton.append(trashText);
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    container.append(checkButton, trashButton);
  }
  return container;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(BOOK_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(BOOK_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(BOOK_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data != null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(BOOK_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});