document.addEventListener('DOMContentLoaded', function () {
    const buyButtons = document.querySelectorAll(".buy-now-btn");
    const purchaseForm = document.getElementById("purchaseForm");
    const thankYou = document.getElementById("thankYou");
    const selectedProductImage = document.getElementById("selectedProductImage");
    const selectedProductName = document.getElementById("selectedProductName");
    const selectedProductPrice = document.getElementById("selectedProductPrice");
    const checkoutForm = document.getElementById("checkoutForm");

    let selectedProduct = '';
    let selectedPrice = '';
    let selectedImage = '';

    //Buy Now buttons
    buyButtons.forEach(button => {
        button.addEventListener("click", function () {
          selectedProduct = this.getAttribute("data-product");
          selectedPrice = this.getAttribute("data-price");
          selectedImage = this.getAttribute("data-image");

          //update form with product details
          selectedProductImage.src = selectedImage;
          selectedProductImage.alt = selectedProduct;
          selectedProductName.textContent = selectedProduct;
          selectedProductPrice.textContent = `Price: $${selectedPrice}`;

          //Show form
          purchaseForm.style.display = 'block';
          purchaseForm.scrollIntoView({ behavior: "smooth" });
        });
    });

    // Handle form submission
    checkoutForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const appointmentdate = document.getElementById('appointmentdate').value;
        const phone = document.getElementById('phone').value;

        const subject = `orderfor: ${selectedProduct}`;
        const body = `
          Hello fadeflex barbering parlour,

          I would like to book an appointment for the following service;

          Product: ${selectedProduct}
          Price: ${selectedPrice}


          My details:
          - Name: ${name}
          - Email: ${email}
          - Appointment Date: ${appointmentdate}
          - Phone: ${phone}

          Please process my booking and let me know the next steps.
        `.trim();

        const mailtoLink = `mailto:nouhadani3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
     
        window.location.herf = mailtoLink;

        purchaseForm.style.display = 'none';
        thankYou.style.display = 'block';
        thankYou.scrollIntoView({ behavior: "smooth" });
    });
 });        




