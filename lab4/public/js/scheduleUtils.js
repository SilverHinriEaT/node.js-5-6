function toggleEdit(id) {
  const form = document.getElementById('edit-form-' + id);
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  const createGameForm = document.getElementById('createGameForm');
  if (createGameForm) {
    createGameForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const teamsError = document.getElementById('teamsError');
      teamsError.style.display = 'none';
      teamsError.textContent = '';

      const formData = new FormData(createGameForm);

      fetch('/schedule/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData)
      })
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              teamsError.textContent = data.error;
              teamsError.style.display = 'block';
            } else {
              window.location.href = '/schedule';
            }
          })
          .catch(error => {
            window.location.href = '/schedule';
          });
    });
  }

  // Handle edit game forms
  const editForms = document.querySelectorAll('form[id^="edit-form-"]');
  editForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const formId = form.id;
      const gameId = formId.split('-')[2];
      const errorDiv = document.getElementById('edit-error-' + gameId);

      errorDiv.style.display = 'none';
      errorDiv.textContent = '';

      const formData = new FormData(form);

      fetch('/schedule/update/' + gameId, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData)
      })
          .then(response => {
            if (!response.ok) {
              return response.json().then(data => {
                throw new Error(data.error);
              });
            }
            return response.json();
          })
          .then(data => {
            if (data.error) {
              errorDiv.textContent = data.error;
              errorDiv.style.display = 'block';
            } else {
              window.location.href = '/schedule';
            }
          })
          .catch(error => {
            errorDiv.textContent = error.message || 'Помилка при оновленні гри';
            errorDiv.style.display = 'block';
          });
    });
  });
});
