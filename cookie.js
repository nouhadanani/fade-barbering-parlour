// ============> Cookies <================
 const banner = document.getElementById("cookie-banner");
 const acceptBtn = document.getElementById("accept-btn");
 const declineBtn = document.getElementById("decline-btn");

//  Check if user has already made a choice
  const consent = localStorage.getItem("cookieConsent");

  if (consent === "accepted") {
    banner.style.display = "none";
    loadAnalytics(); // Load analytics only if accepted 
  } else if (consent === "declined") {
    banner.style.display = 'none';
  }

  // Accept cookies
  acceptBtn.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "accepted");
    banner.style.display = "none";
    loadAnalytics(); // IMPORTANT
  });

  // Decline cookies
  declineBtn.addEventListener("click", () => {
    localStorage.setItem("cookieConsent", "declined");
    banner.style.display = "none";
  });

  // on page load, check past choise 

  window.onload = function() {

    if(localStorage.getItem("cookiesAccepted")==="true"){
      loadAnalytics();
      document.getElementById("cookie-banner").style.display="none";

    } else if (localStorage.getItem("cookiesAccepted")==="false"){
      document.getElementById("cookie-banner").style.display="none";
    }
  }