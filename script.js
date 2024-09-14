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
    const closeModalBtn = document.querySelector('.edit-modal .close');
    const copyNotification = document.getElementById('copy-notification');
    const successNotification = document.getElementById('success-notification');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const pageInfo = document.getElementById('page-info');
    const searchInput = document.getElementById('search');

    let currentPage = 1;
    const itemsPerPage = 10;
    const correctPassword = '1221';
    let currentEditKey = null; // Track the square being edited

    function showPasswordModal() {
        passwordModal.style.display = 'block';
    }

    function hidePasswordModal() {
        passwordModal.style.display = 'none';
    }

    function showEditModal() {
        editModal.style.display = 'block';
    }

    function hideEditModal() {
        editModal.style.display = 'none';
    }

    function showNotification(notificationElement, message) {
        notificationElement.textContent = message;
        notificationElement.classList.add('visible');
        setTimeout(() => {
            notificationElement.classList.remove('visible');
        }, 2000); // Duration for the notification to be visible
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

    function renderSquares(searchTerm = '') {
        database.ref('squares').once('value').then(snapshot => {
            const squaresData = snapshot.val() || {};
            squaresContainer.innerHTML = '';

            // Filter and paginate data
            const filteredKeys = Object.keys(squaresData).filter(key => 
                squaresData[key].title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            const filteredData = Object.values(squaresData).filter(data => 
                data.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedData = filteredData.slice(startIndex, endIndex);

            paginatedData.forEach((data, index) => {
                const squareKey = filteredKeys[index + startIndex]; // Use filtered keys
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.key = squareKey;
                square.innerHTML = `
                    <div class="title-container">
                        <div class="title">${data.title || 'No Title'}</div>
                        <div class="button-container">
                            <button class="copy-btn" title="Copy Command">📋</button>
                            <button class="edit-btn" title="Edit Command">✏️</button>
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

    function addSquare(title, command) {
        const newSquareRef = database.ref('squares').push();
        const squareId = newSquareRef.key; // Firebase generated ID
        newSquareRef.set({
            id: squareId, // Add ID to square
            title: title,
            command: command
        }).then(() => {
            renderSquares(searchInput.value);
        }).catch(error => {
            console.error('Error adding square:', error);
        });
    }

    function handleDelete(key) {
        const userConfirmed = confirm('Are you sure you want to delete this item?');
        if (userConfirmed) {
            database.ref('squares/' + key).remove()
                .then(() => {
                    renderSquares(searchInput.value);
                })
                .catch(error => {
                    console.error('Error deleting square:', error);
                });
        }
    }

    function handleCopy(text) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification(copyNotification, 'Command copied!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    function saveEdit() {
        showNotification(successNotification, 'Changes saved successfully!');
    }

    function handleEdit(key) {
        database.ref('squares/' + key).once('value').then(snapshot => {
            const squareData = snapshot.val();
            currentEditKey = key;
            modalTitleInput.value = squareData.title || '';
            modalCommandInput.value = squareData.command || '';
            showEditModal(); // Show the edit modal
        });
    }

    function confirmEdit() {
        return new Promise((resolve) => {
            const userConfirmed = confirm('Are you sure you want to save these changes?');
            resolve(userConfirmed);
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
            renderSquares(searchInput.value);
        }
    });

    nextBtn.addEventListener('click', () => {
        currentPage++;
        renderSquares(searchInput.value);
    });

    searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderSquares(searchInput.value);
    });

    passwordSubmitBtn.addEventListener('click', handlePasswordSubmit);

    squaresContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const key = e.target.closest('.square').dataset.key;
            handleDelete(key);
        } else if (e.target.classList.contains('copy-btn')) {
            const command = e.target.closest('.square').querySelector('.command').textContent;
            handleCopy(command);
        } else if (e.target.classList.contains('edit-btn')) {
            const key = e.target.closest('.square').dataset.key;
            handleEdit(key);
        }
    });

    saveBtn.addEventListener('click', async () => {
        const updatedTitle = modalTitleInput.value.trim();
        const updatedCommand = modalCommandInput.value.trim();

        const userConfirmed = await confirmEdit();
        if (userConfirmed && currentEditKey && updatedTitle && updatedCommand) {
            database.ref('squares/' + currentEditKey).update({
                title: updatedTitle,
                command: updatedCommand
            }).then(() => {
                hideEditModal();
                showNotification(successNotification, 'Changes saved successfully!');
                renderSquares(searchInput.value);
            }).catch(error => {
                console.error('Error updating square:', error);
            });
        }
    });

    closeModalBtn.addEventListener('click', () => {
        hideEditModal();
    });

    showPasswordModal();
});
