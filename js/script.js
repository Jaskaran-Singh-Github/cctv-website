"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".primary-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const path = window.location.pathname.split("/").pop() || "index.html";
  const pageKey = path === "index.html" ? "home" : path.replace(".html", "");
  const activeLink = document.querySelector('[data-nav="' + pageKey + '"]');
  const year = document.querySelector("[data-year]");
  const backToTop = document.querySelector(".back-to-top");
  const toast = document.querySelector(".toast");

  if (activeLink) activeLink.setAttribute("aria-current", "page");
  if (year) year.textContent = String(new Date().getFullYear());

  const themeToggleButtons = document.querySelectorAll(".theme-toggle");
  let darkThemeEnabled = false;
  try {
    darkThemeEnabled = window.localStorage.getItem("hs-electrical-theme") === "dark";
  } catch (error) {
    console.warn("The saved colour theme could not be read.", error);
  }

  function updateTheme(enabled, savePreference) {
    darkThemeEnabled = enabled;
    document.documentElement.dataset.theme = enabled ? "dark" : "light";
    themeToggleButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(enabled));
      button.setAttribute("aria-label", enabled ? "Switch to light mode" : "Switch to dark mode");
      button.title = enabled ? "Switch to light mode" : "Switch to dark mode";
      const label = button.querySelector(".theme-toggle-text");
      if (label) label.textContent = enabled ? "Light mode" : "Dark mode";
    });

    if (savePreference) {
      try {
        window.localStorage.setItem("hs-electrical-theme", enabled ? "dark" : "light");
      } catch (error) {
        console.warn("The colour theme could not be saved.", error);
      }
    }
  }

  updateTheme(darkThemeEnabled, false);
  themeToggleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      updateTheme(!darkThemeEnabled, true);
    });
  });

  if (nav && menuToggle) {
    menuToggle.addEventListener("click", function () {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      });
    });

    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
        nav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
      }
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  function updateScrollControls() {
    if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 420);
  }
  window.addEventListener("scroll", updateScrollControls, { passive: true });
  updateScrollControls();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 6500);
  }

  const serviceSelect = document.querySelector("#service-select");
  const params = new URLSearchParams(window.location.search);
  const requestedService = params.get("service");
  const requestedProduct = params.get("product");
  if (serviceSelect && requestedService) {
    const matchingOption = Array.from(serviceSelect.options).find(function (option) {
      return option.value.toLowerCase() === requestedService.toLowerCase() ||
        option.textContent.trim().toLowerCase() === requestedService.toLowerCase();
    });
    if (matchingOption) serviceSelect.value = matchingOption.value || matchingOption.textContent.trim();
  }
  if (serviceSelect && requestedProduct) {
    serviceSelect.value = "Camera / Product Enquiry";
    const message = document.querySelector("#contact-form [name='message']");
    if (message) message.value = "I’d like to know more about " + requestedProduct + ".";
  }

  const productDescriptions = {
    "Dome CCTV Cameras": "Dome cameras have a compact housing and can work well for indoor and covered areas. The best fit depends on mounting position, lighting, viewing angle and the recording setup.",
    "Bullet CCTV Cameras": "Bullet cameras are a visible, directional option often considered for outdoor walls and perimeter views. We can help assess weather exposure, placement and the view you need.",
    "Wireless CCTV Cameras": "Wireless camera options can reduce video cabling but still depend on power, network coverage and site conditions. Let’s check what would be practical for your property.",
    "HD Security Cameras": "HD cameras can offer detailed video for important areas. Resolution, lens, lighting and recording equipment all affect the final result and should be considered together.",
    "Night Vision Cameras": "Night-vision options are designed to support visibility in low-light conditions. Available night performance varies by model and the lighting around the installation area.",
    "IP Cameras": "IP cameras connect through a network and may support remote viewing. PTZ models can pan, tilt and zoom where supported; the right choice depends on camera features, network setup and recording equipment."
  };
  const productDialog = document.querySelector(".product-dialog");
  const productTitle = document.querySelector("#product-dialog-title");
  const productCopy = document.querySelector(".product-dialog-copy");
  const productQuote = document.querySelector(".product-dialog-quote");
  document.querySelectorAll(".product-details").forEach(function (button) {
    button.addEventListener("click", function () {
      const productName = button.dataset.product;
      if (!productDialog || !productTitle || !productCopy) return;
      productTitle.textContent = productName;
      productCopy.textContent = productDescriptions[productName] || "Ask us about current models and suitable options for your property.";
      if (productQuote) productQuote.href = "contact.html?product=" + encodeURIComponent(productName);
      if (typeof productDialog.showModal === "function") productDialog.showModal();
      else showToast("For details about " + productName + ", please contact our team.");
    });
  });
  if (productDialog) {
    productDialog.addEventListener("click", function (event) {
      if (event.target === productDialog) productDialog.close();
    });
  }

  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("invalid", function () {
      showToast("Please check the highlighted fields and complete each required field.");
    }, true);
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!contactForm.reportValidity()) {
        showToast("Please check the form and complete each required field.");
        return;
      }
      const formData = new FormData(contactForm);
      const subject = "CCTV security enquiry — " + formData.get("service");
      const body = [
        "Name: " + formData.get("name"),
        "Phone: " + formData.get("phone"),
        "Email: " + formData.get("email"),
        "Service: " + formData.get("service"),
        "",
        "Message:",
        formData.get("message")
      ].join("\n");
      showToast("Opening your email app with the enquiry. If it doesn’t open, call or WhatsApp us directly.");
      window.location.href = "mailto:harminder12780@gmail.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }
});
