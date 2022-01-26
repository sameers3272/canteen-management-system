$(document).ready(function() {
  $('#search').keyup(function(event) {
      if (event.which === 13)
      {
          event.preventDefault();
          $('#seach-form').submit();
      }
  });
});



const togglePassword = document.querySelector("#password-icon");
const password = document.querySelector("#password");

togglePassword.addEventListener("click", function () {
  let type;
  if(password.getAttribute("type") === "password"){
     type =  "text";
     this.classList.remove("mdi-eye");
     this.classList.add("mdi-eye-off");
  }
  else{
    type =  "password";
    this.classList.remove("mdi-eye-off");
    this.classList.add("mdi-eye");
  }
  
  password.setAttribute("type", type);

});



