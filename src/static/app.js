document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Crear lista de participantes sin viñetas y con icono de eliminar
        let participantsList = "<p><em>No participants yet</em></p>";
        if (details.participants.length > 0) {
          participantsList = `<div class="participants-list" style="list-style:none; padding-left:0;">` +
            details.participants.map(p => `
              <span class="participant-item" style="display:flex;align-items:center;margin-bottom:4px;">
                <span style="flex:1;">${p}</span>
                <button class="delete-participant" title="Remove" data-activity="${name}" data-email="${p}" style="background:none;border:none;cursor:pointer;color:#c00;font-size:1.2em;margin-left:8px;">&#128465;</button>
              </span>
            `).join("") +
            `</div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants (${details.participants.length}/${details.max_participants}):</strong>
            ${participantsList}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Asignar eventos a los botones de eliminar
      document.querySelectorAll('.delete-participant').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const activity = btn.getAttribute('data-activity');
          const email = btn.getAttribute('data-email');
          if (confirm(`¿Eliminar a ${email} de ${activity}?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/participant?email=${encodeURIComponent(email)}`, {
                method: 'DELETE'
              });
              const result = await response.json();
              if (response.ok) {
                messageDiv.textContent = result.message;
                messageDiv.className = "success";
                fetchActivities(); // Recargar actividades
              } else {
                messageDiv.textContent = result.detail || "Error removing participant";
                messageDiv.className = "error";
              }
              messageDiv.classList.remove("hidden");
              setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
            } catch (error) {
              messageDiv.textContent = "Failed to remove participant.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
            }
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Actualizar actividades tras registro
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
