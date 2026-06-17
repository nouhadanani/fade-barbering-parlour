document.addEventListener("DOMContentLoaded", () => {
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach(question => {
        question.addEventListener("click", () => {
            const faqItem = question.parentElement;
            const faqAnswer = question.nextElementSibling;
            const isCurrentlyActive = faqItem.classList.contains("active");

            // Close all other open FAQ items (optional, comment out if you want multiple items open at once)
            document.querySelectorAll(".faq-item").forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove("active");
                    item.querySelector(".faq-question").setAttribute("aria-expanded", "false");
                    item.querySelector(".faq-answer").style.maxHeight = null;
                }
            });

            // Toggle current item
            if (!isCurrentlyActive) {
                faqItem.classList.add("active");
                question.setAttribute("aria-expanded", "true");
                // Dynamically sets maximum height based on individual text block height for flawless CSS transitions
                faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
            } else {
                faqItem.classList.remove("active");
                question.setAttribute("aria-expanded", "false");
                faqAnswer.style.maxHeight = null;
            }
        });
    });
});
