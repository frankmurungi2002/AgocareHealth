
document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll('.otp-entry');

    // Focus first input initially
    inputs[0].focus();

    inputs.forEach((box, index) => {
        box.addEventListener('input', (e) => {
            // Only allow digits
            box.value = box.value.replace(/[^0-9]/g, '');

            // Move to next box if current has a value
            if (box.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        box.addEventListener('keydown', (e) => {
            // Allow backspace to move back
            if (e.key === 'Backspace' && !box.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        box.addEventListener('input', () => {
            // Make the Continue button become active
            const btn = document.getElementById("continue-button-2");

            if (inputs[5].value.trim() !== "") {
                otp = inputs[0].value + inputs[1].value + inputs[2].value + inputs[3].value + inputs[4].value + inputs[5].value
                if (otp === "123456"){
                    continue_button('form-2', 'form-3');
                } else {
                    document.getElementById("incorrect").classList.remove("hidden");
                }
            } else{
                document.getElementById("incorrect").classList.add("hidden");
            }

            // if (inputs[5].value.trim() !== "") {
            //     btn.classList.add("filled");
            // } else {
            //     btn.classList.remove("filled");
            // }
        });
    });
});

// document.addEventListener("DOMContentLoaded", () => {
//     const inputs = document.querySelectorAll('.otp-entry');

//     // Focus first input initially (only if visible)
//     if (inputs.length > 0) {
//         inputs[0].focus();
//     }

//     inputs.forEach((box, index) => {
//         box.addEventListener('input', (e) => {
//             // Only allow digits
//             box.value = box.value.replace(/[^0-9]/g, '');

//             // Move to next box if current has a value
//             if (box.value && index < inputs.length - 1) {
//                 inputs[index + 1].focus();
//             }

//             // ---- OTP CHECK ----
//             let otp = "";
//             inputs.forEach(input => {
//                 otp += input.value;
//             });

//             if (otp.length === 6) {
//                 if (otp === "123456") {
//                     continue_button('form-2', 'form-3');
//                 } else {
//                     document.getElementById("incorrect").classList.remove("hidden");
//                 }
//             }
//         });

//         box.addEventListener('keydown', (e) => {
//             // Allow backspace to move back
//             if (e.key === 'Backspace' && !box.value && index > 0) {
//                 inputs[index - 1].focus();
//             }
//         });
//     });
// });


function continue_button(current, next) {
    document.querySelector(`.${current}`).classList.add("hidden");
    document.querySelector(`.${next}`).classList.remove("hidden");

    if (next === "form-2") {
        const firstOtp = document.querySelector(".otp-entry");
        if (firstOtp) {
            firstOtp.focus();
        }
    }
}

function continue_button_1(event){
    event.preventDefault();

    const email = document.getElementById("email-entry").value;
    document.getElementById('user-email').textContent = email;

    // document.querySelector('.form-1-correct-action').classList.remove("hidden");
    document.querySelector('.form-1-correct-action').classList.add("show");

    // Link to java(backend)
    
}

function continue_button_3(event){
    event.preventDefault();

    new_password = document.getElementById("password-entry").value;
    confirm_new_password = document.getElementById("confirm-password-entry").value;

    if (new_password === confirm_new_password){
        // Redirect to login page
        window.location.href = "Login.html";
    }
}

function resend_OTP(){
    alert("OTP re-sent"); // To be removed and link to java(backend)
}

function proceed_button(){
    document.querySelector('.form-1-correct-action').classList.remove("show");
    document.querySelector('.form-1').classList.add("hidden");
    document.querySelector('.form-2').classList.remove("hidden");
}

// For Password Fields to enable one view their passwords
function toggle_password(button) {
    const container = button.parentElement;
    const input = container.querySelector('input');
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text'; //Displaying the Password

        // Change the icons
        icon.classList.replace('fa-eye', 'fa-eye-slash');
        // icon.classList.remove('fa-eye');
        // icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password'; // Hiding the Password

        // Change the icons
        icon.classList.replace('fa-eye-slash', 'fa-eye');
        // icon.classList.remove('fa-eye');
        // icon.classList.add('fa-eye-slash');
    }
}

