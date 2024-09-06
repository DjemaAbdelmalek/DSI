document.addEventListener('DOMContentLoaded', () => {
    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBLp_Fxkt6DW-lDEpulD4mekAs6WVz46ZE",
        authDomain: "dsi-project-7f527.firebaseapp.com",
        databaseURL: "https://dsi-project-7f527-default-rtdb.firebaseio.com",
        projectId: "dsi-project-7f527",
        storageBucket: "dsi-project-7f527.appspot.com",
        messagingSenderId: "721547199605",
        appId: "1:721547199605:web:0296dd3f9a2d542fd5a43c"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // DOM elements
    const passwordModal = document.getElementById('password-modal');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmitBtn = document.getElementById('password-submit-btn');
    const passwordError = document.getElementById('password-error');
    const squaresContainer = document.getElementById('squares-container');
    const addContainer = document.getElementById('add-container');
    const titleInput = document.getElementById('title-input');
    const commandInput = document.getElementById('command-input');
    const addBtn = document.getElementById('add-btn');
    const confirmAddBtn = document.getElementById('confirm-add-btn');
    const editModal = document.getElementById('edit-modal');
    const modalTitleInput = document.getElementById('modal-title-input');
    const modalCommandInput = document.getElementById('modal-command-input');
    const saveBtn = document.getElementById('save-btn');
    const closeModalBtn = document.querySelector('.close');
    const copyNotification = document.getElementById('copy-notification');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const pageInfo = document.getElementById('page-info');
    const searchInput = document.getElementById('search');

    let currentPage = 1;
    const itemsPerPage = 10;
    const correctPassword = 'ymar4202'; // Change this to your desired password

    function showPasswordModal() {
        passwordModal.style.display = 'block';
    }

    function hidePasswordModal() {
        passwordModal.style.display = 'none';
    }

    function handlePasswordSubmit() {
        const enteredPassword = passwordInput.value.trim();
        if (enteredPassword === correctPassword) {
            hidePasswordModal();
            renderSquares(); // Initial render
        } else {
            passwordError.classList.remove('hidden');
        }
    }

    function updateLocalStorage() {
        // Get all squares from Firebase and save to localStorage
        database.ref('squares').once('value').then(snapshot => {
            const squaresData = snapshot.val() || {};
            localStorage.setItem('squaresData', JSON.stringify(squaresData));
            renderSquares();
        });
    }

    function renderSquares(searchTerm = '') {
        database.ref('squares').once('value').then(snapshot => {
            const squaresData = snapshot.val() || {};
            squaresContainer.innerHTML = '';
            const filteredData = Object.values(squaresData).filter(data => data.title.toLowerCase().includes(searchTerm.toLowerCase()));
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedData = filteredData.slice(startIndex, endIndex);

            paginatedData.forEach((data, index) => {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.key = Object.keys(squaresData)[index + startIndex];
                square.innerHTML = `
                    <div class="title-container">
                        <div class="title">${data.title || 'No Title'}</div>
                        <div class="button-container">
                            <button class="copy-btn" title="Copy Command">📋</button>
                            <button class="delete-btn" title="Delete Command">🗑️</button>
                        </div>
                    </div>
                    <pre class="command">${data.command || 'No Command'}</pre>
                `;
                squaresContainer.appendChild(square);
            });

            updatePaginationControls(filteredData.length);
        });
    }

    function updatePaginationControls(totalItems) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    function showNotification() {
        copyNotification.classList.add('visible');
        setTimeout(() => {
            copyNotification.classList.remove('visible');
        }, 2000); // Notification will be visible for 2 seconds
    }

    function addSquare(title, command) {
        const newSquareRef = database.ref('squares').push();
        newSquareRef.set({
            title: title,
            command: command
        }).then(() => {
            renderSquares(searchInput.value); // Pass search term to renderSquares
        }).catch(error => {
            console.error('Error adding square:', error);
        });
    }

    function handleDelete(key) {
        database.ref('squares/' + key).remove()
            .then(() => {
                renderSquares(searchInput.value); // Pass search term to renderSquares
            })
            .catch(error => {
                console.error('Error deleting square:', error);
            });
    }

    function handleCopy(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification();
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    addBtn.addEventListener('click', () => {
        addContainer.classList.toggle('hidden');
    });

    confirmAddBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const command = commandInput.value.trim();
        if (title && command) {
            addSquare(title, command);
            titleInput.value = '';
            commandInput.value = '';
            addContainer.classList.add('hidden');
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderSquares(searchInput.value); // Pass search term to renderSquares
        }
    });

    nextBtn.addEventListener('click', () => {
        currentPage++;
        renderSquares(searchInput.value); // Pass search term to renderSquares
    });

    squaresContainer.addEventListener('click', (event) => {
        const square = event.target.closest('.square');
        const key = square.dataset.key;

        if (event.target.classList.contains('copy-btn')) {
            const commandText = square.querySelector('.command').textContent.trim();
            handleCopy(commandText);
        }

        if (event.target.classList.contains('delete-btn')) {
            handleDelete(key);
        }
    });

    closeModalBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
    });

    searchInput.addEventListener('input', () => {
        currentPage = 1; // Reset to first page on search
        renderSquares(searchInput.value); // Pass search term to renderSquares
    });

    passwordSubmitBtn.addEventListener('click', handlePasswordSubmit);

    // Show password modal on page load
    showPasswordModal();
});
