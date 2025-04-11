document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById("contactForm");
  const successMessage = document.getElementById("successMessage");
  
  // Adiciona containers para dias e horários
  const diasContainer = document.createElement('div');
  diasContainer.className = 'dias-container';
  
  // Adiciona título para a seção de horários
  const horariosTitle = document.createElement('h2');
  horariosTitle.textContent = 'Selecione os horários disponíveis';
  contactForm.insertBefore(horariosTitle, contactForm.querySelector('input[type="submit"]'));
  contactForm.insertBefore(diasContainer, contactForm.querySelector('input[type="submit"]'));
  
  // Adiciona mensagem de erro para horários
  const horariosError = document.createElement('div');
  horariosError.id = 'horariosError';
  horariosError.className = 'error-message';
  horariosError.textContent = 'Selecione pelo menos um horário';
  contactForm.insertBefore(horariosError, contactForm.querySelector('input[type="submit"]'));
  
  // Dias da semana e horários
  const diasSemana = [
      { id: 'segunda', nome: 'Segunda-feira' },
      { id: 'terca', nome: 'Terça-feira' },
      { id: 'quarta', nome: 'Quarta-feira' },
      { id: 'quinta', nome: 'Quinta-feira' },
      { id: 'sexta', nome: 'Sexta-feira' }
  ];
  
  // Gera containers para cada dia com horários
  diasSemana.forEach(dia => {
      const diaBox = document.createElement('div');
      diaBox.className = 'dia-box';
      
      const diaTitulo = document.createElement('div');
      diaTitulo.className = 'dia-titulo';
      diaTitulo.textContent = dia.nome;
      
      const horariosContainer = document.createElement('div');
      horariosContainer.className = 'horarios-container';
      
      //checkbox para selecionar todos os horários do dia
      const selectAllLabel = document.createElement('label');
      selectAllLabel.className = 'horario-checkbox select-all-container';
      
      const selectAllCheckbox = document.createElement('input');
      selectAllCheckbox.type = 'checkbox';
      selectAllCheckbox.className = 'select-all';
      selectAllCheckbox.dataset.dia = dia.id;
      
      selectAllLabel.appendChild(selectAllCheckbox);
      selectAllLabel.appendChild(document.createTextNode('Selecionar todos'));
      
      horariosContainer.appendChild(selectAllLabel);
      
      // Gera horários das 8h às 20h para cada dia
      for (let hora = 8; hora <= 20; hora++) {
          const horarioLabel = document.createElement('label');
          horarioLabel.className = 'horario-checkbox';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = 'horarios';
          checkbox.value = `${dia.id}-${hora}:00`;
          checkbox.dataset.dia = dia.id;
          
          horarioLabel.appendChild(checkbox);
          horarioLabel.appendChild(document.createTextNode(` ${hora}:00`));
          
          horariosContainer.appendChild(horarioLabel);
      }
      
      diaBox.appendChild(diaTitulo);
      diaBox.appendChild(horariosContainer);
      diasContainer.appendChild(diaBox);
  });
  
  // Adiciona evento para selecionar todos os horários de um dia
  document.querySelectorAll('.select-all').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
          const dia = this.dataset.dia;
          const horariosDia = document.querySelectorAll(`input[name="horarios"][data-dia="${dia}"]`);
          horariosDia.forEach(h => h.checked = this.checked);
          
          // Dispara evento de change para validar
          if (horariosDia.length > 0) {
              const event = new Event('change');
              horariosDia[0].dispatchEvent(event);
          }
      });
  });
  
  // Validação do lado do cliente
  const validateField = (field, errorId, validationFn) => {
      const errorElement = document.getElementById(errorId);
      const isValid = validationFn(field.value);
      
      if (!isValid) {
          field.classList.add('invalid');
          errorElement.style.display = 'block';
          return false;
      } else {
          field.classList.remove('invalid');
          errorElement.style.display = 'none';
          return true;
      }
  };
  
  // Validações específicas (incluindo horários)
  const validations = {
      nome: value => value.length >= 3,
      email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      telefone: value => /^\d{10,11}$/.test(value),
      idade: value => value >= 1 && value <= 105,
      cidadeuf: value => value.length >= 2,
      genero: value => value !== "",
      profissao: value => value.length >= 2 && value.length <= 50,
      acompanhamento: value => value !== "",
      valor: value => value !== "",
      horarios: () => {
          const selected = document.querySelectorAll('input[name="horarios"]:checked');
          return selected.length > 0;
      }
  };
  
  // Adiciona validação em tempo real
  Object.keys(validations).forEach(fieldName => {
      if (fieldName === 'horarios') {
          document.querySelectorAll('input[name="horarios"]').forEach(checkbox => {
              checkbox.addEventListener('change', () => {
                  const isValid = validations.horarios();
                  const errorElement = document.getElementById('horariosError');
                  
                  if (!isValid) {
                      errorElement.style.display = 'block';
                  } else {
                      errorElement.style.display = 'none';
                  }
              });
          });
      } else {
          const field = document.getElementById(fieldName);
          if (field) {
              field.addEventListener('blur', () => {
                  validateField(field, `${fieldName}Error`, validations[fieldName]);
              });
          }
      }
  });
  
  // Envio do formulário
  contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Valida todos os campos
      let formIsValid = true;
      Object.keys(validations).forEach(fieldName => {
          if (fieldName === 'horarios') {
              const isValid = validations.horarios();
              const errorElement = document.getElementById('horariosError');
              
              if (!isValid) {
                  errorElement.style.display = 'block';
                  formIsValid = false;
              } else {
                  errorElement.style.display = 'none';
              }
          } else {
              const field = document.getElementById(fieldName);
              if (field) {
                  const isValid = validateField(field, `${fieldName}Error`, validations[fieldName]);
                  formIsValid = formIsValid && isValid;
              }
          }
      });
      
      if (!formIsValid) {
          alert("Por favor, corrija os campos destacados.");
          return;
      }
      
      // Coleta todos os dados do formulário, incluindo horários selecionados
      const formData = {
          nome: document.getElementById("nome").value,
          email: document.getElementById("email").value,
          telefone: document.getElementById("telefone").value,
          idade: parseInt(document.getElementById("idade").value),
          cidadeuf: document.getElementById("cidadeuf").value,
          genero: document.getElementById("genero").value,
          profissao: document.getElementById("profissao").value,
          acompanhamento: document.getElementById("acompanhamento").value,
          valor: document.getElementById("mensagem").value,
          horarios: Array.from(document.querySelectorAll('input[name="horarios"]:checked')).map(el => el.value)
      };
      
      try {
          const response = await fetch("/send-message", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData),
          });
          
          const responseData = await response.json();
          
          if (!response.ok) {
              // Mostra erros específicos nos campos
              if (responseData.errors) {
                  responseData.errors.forEach(error => {
                      const errorElement = document.getElementById(`${error.field}Error`);
                      if (errorElement) {
                          errorElement.textContent = error.message;
                          errorElement.style.display = 'block';
                          const field = document.getElementById(error.field);
                          if (field) field.classList.add('invalid');
                      }
                  });
              } else {
                  throw new Error(responseData.message || "Erro ao enviar formulário");
              }
              return;
          }
          
          // Sucesso
          contactForm.style.display = 'none';
          successMessage.style.display = 'block';
          setTimeout(() => {
              contactForm.reset();
              contactForm.style.display = 'block';
              successMessage.style.display = 'none';
          }, 3000);
          
      } catch (error) {
          console.error("Erro:", error);
          alert("Erro ao enviar: " + error.message);
      }
  });
});