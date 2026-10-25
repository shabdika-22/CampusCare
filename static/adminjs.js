let selectedRow = null;
const complaintRows = document.querySelectorAll(".admin-complaints-table tr");
complaintRows.forEach(function(row) {
    row.addEventListener("click", function() {
        const clickedRow = row;
        selectedRow = clickedRow;

        const cells = clickedRow.querySelectorAll("td");

        const complaintId = cells[0].textContent;
        const complaintTitle = cells[1].textContent;
        const studentName = cells[2].textContent;
        const category = cells[3].textContent;
        const status = cells[4].textContent;
        const complaintLocation = clickedRow.dataset.location;
const complaintDescription = clickedRow.dataset.description;

        console.log(complaintId, complaintTitle, studentName, category, status);
        const detailId = document.getElementById("detail-id");

detailId.textContent = complaintId;
const detailTitle = document.getElementById("detail-title");

detailTitle.textContent = complaintTitle;
const detailStudent = document.getElementById("detail-student");

detailStudent.textContent = studentName;
const detailCategory = document.getElementById("detail-category");

detailCategory.textContent = category;
const detailLocation = document.getElementById("detail-location");
detailLocation.textContent = complaintLocation;

const detailDescription = document.getElementById("detail-description");
detailDescription.textContent = complaintDescription;
const detailStatus = document.querySelector(".admin-complaint-details select");

detailStatus.value = status;
const adminResponse = document.getElementById("adminResponse");
adminResponse.value = clickedRow.dataset.response || "";

        const complaintDetails = document.querySelector(".admin-complaint-details");

        complaintDetails.style.display = "block";

    });

});

const updateComplaintForm = document.getElementById("updateComplaintForm");

updateComplaintForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (selectedRow === null) {
        alert("Please select a complaint first.");
        return;
    }

    const complaintDbId = selectedRow.dataset.dbId;

    if (!complaintDbId) {
        alert("Complaint database ID not found. Please check admin.html.");
        return;
    }

    const formData = new FormData(updateComplaintForm);

    try {
        const response = await fetch(
            `/update_complaint/${complaintDbId}`,
            {
                method: "POST",
                body: formData
            }
        );

        if (response.redirected || response.ok) {
            selectedRow.cells[4].textContent = formData.get("status");
            selectedRow.dataset.response = formData.get("admin_response");
            alert("Complaint updated successfully!");
        } else {
            alert("Could not update complaint. Please try again.");
        }
    } catch (error) {
        alert("Server connection error. Please check that Flask is running.");
    }
});
const searchInput = document.getElementById("searchComplaint");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
function filterComplaints() {
    const searchValue = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    const statusValue = statusFilter.value;

    complaintRows.forEach(function(row) {

        const cells = row.querySelectorAll("td");

        if (cells.length === 0) {
            return;
        }

        const complaintText = cells[1].textContent.toLowerCase();
        const studentText = cells[2].textContent.toLowerCase();
        const categoryText = cells[3].textContent;
        const statusText = cells[4].textContent;

        const searchMatch =
            complaintText.includes(searchValue) ||
            studentText.includes(searchValue);

        const categoryMatch =
            categoryValue === "All Categories" ||
            categoryText === categoryValue;

        const statusMatch =
            statusValue === "All Status" ||
            statusText === statusValue;

        row.style.display =
            searchMatch && categoryMatch && statusMatch
                ? ""
                : "none";
    });
}
searchInput.addEventListener("input", filterComplaints);
categoryFilter.addEventListener("change", filterComplaints);
statusFilter.addEventListener("change", filterComplaints);
const viewAllBtn = document.getElementById("viewAllBtn");
complaintRows.forEach(function(row, index) {
    if (index > 3) {
        row.style.display = "none";
    }
});
viewAllBtn.addEventListener("click", function() {

    if (viewAllBtn.textContent === "View All Complaints") {

        complaintRows.forEach(function(row, index) {
            if (index > 3) {
                row.style.display = "";
            }
        });

        viewAllBtn.textContent = "Show Less";

    } else {

        complaintRows.forEach(function(row, index) {
            if (index > 3) {
                row.style.display = "none";
            }
        });

        viewAllBtn.textContent = "View All Complaints";
    }
});
const categoryChart = document.getElementById("categoryChart");
const categoryData = JSON.parse(
    document.getElementById("category-data").textContent
);
console.log(categoryData);
const maxCount = Math.max(...Object.values(categoryData));

for (const category in categoryData) {
    const row = document.createElement("div");
    row.className = "chart-row";

    const label = document.createElement("span");
    label.className = "chart-label";
    label.textContent = category;

    const barArea = document.createElement("div");
    barArea.className = "chart-bar-area";

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.width = (categoryData[category] / maxCount * 100) + "%";

    const count = document.createElement("span");
    count.className = "chart-count";
    count.textContent = categoryData[category];

    barArea.appendChild(bar);
    row.appendChild(label);
    row.appendChild(barArea);
    row.appendChild(count);

    categoryChart.appendChild(row);
}

const successMessage = document.querySelector(".success-message");

if (successMessage) {
    setTimeout(function() {
        successMessage.style.display = "none";
    }, 3000);
}