
const openButton = document.getElementById("openRegisterPopup");
const popup = document.getElementById("registerPopup");
const closeButton = document.getElementById("closeRegisterPopup");

openButton.addEventListener("click", function () {
    popup.classList.add("active");
});

closeButton.addEventListener("click", function () {
    popup.classList.remove("active");
});

// Popup ke bahar click karne par band ho
popup.addEventListener("click", function (event) {
    if (event.target === popup) {
        popup.classList.remove("active");
    }
});

// Escape key se popup band ho
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        popup.classList.remove("active");
    }
});


const openLoginPopup = document.getElementById("openLoginPopup");
const loginPopup = document.getElementById("loginPopup");
const closeLoginPopup = document.getElementById("closeLoginPopup");

if (openLoginPopup && loginPopup) {
    openLoginPopup.addEventListener("click", function () {
        loginPopup.classList.add("active");
    });
}

if (closeLoginPopup && loginPopup) {
    closeLoginPopup.addEventListener("click", function () {
        loginPopup.classList.remove("active");
    });
}

if (loginPopup) {
    loginPopup.addEventListener("click", function (event) {
        if (event.target === loginPopup) {
            loginPopup.classList.remove("active");
        }
    });
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && loginPopup) {
        loginPopup.classList.remove("active");
    }
});
// Incorrect login ke baad popup dobara open karo
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get("login_error") === "1" && loginPopup) {
    loginPopup.classList.add("active");
}