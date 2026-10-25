const newComplaintBtn = document.getElementById("newComplaintBtn");
const complaintForm = document.getElementById("new-complaint");
complaintForm.style.display = "none";
newComplaintBtn.addEventListener("click", function(event) {
    event.preventDefault();
    complaintForm.style.display = "block";})
    const complaintRows = document.querySelectorAll(".complaints-table tr");

complaintRows.forEach(function(row, index) {

    if (index === 0) {
        return;
    }

    row.style.cursor = "pointer";

});
complaintRows.forEach(function(row, index) {

    if (index === 0) {
        return;
    }

    row.addEventListener("click", function() {

        const complaintDetails = document.querySelector(".complaint-details");

        const complaintId = row.dataset.id;
        const complaintLocation = row.dataset.location;
        const complaintDescription = row.dataset.description;
        const complaintTitle = row.dataset.title;
        const complaintCategory = row.dataset.category;
        const complaintDate = row.dataset.date;
        const complaintStatus = row.dataset.status;
        const adminResponse = row.dataset.response || "No response yet.";
        document.getElementById("student-admin-response").textContent = adminResponse;

        complaintDetails.querySelector("p:nth-of-type(1)").innerHTML =
            "<strong>Complaint ID:</strong> " + complaintId;

            complaintDetails.querySelector("p:nth-of-type(2)").innerHTML =
    "<strong>Complaint Title:</strong> " + complaintTitle;

complaintDetails.querySelector("p:nth-of-type(3)").innerHTML =
    "<strong>Category:</strong> " + complaintCategory;

complaintDetails.querySelector("p:nth-of-type(5)").innerHTML =
    "<strong>Date:</strong> " + complaintDate;

complaintDetails.querySelector("p:nth-of-type(7)").innerHTML =
    "<strong>Status:</strong> " + complaintStatus;

        complaintDetails.querySelector("p:nth-of-type(4)").innerHTML =
            "<strong>Location:</strong> " + complaintLocation;

        complaintDetails.querySelector("p:nth-of-type(6)").innerHTML =
            "<strong>Description:</strong> " + complaintDescription;

        complaintDetails.style.display = "block";
    });

});