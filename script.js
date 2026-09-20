/* ==========================================================================
   GK Holidays - Interactivity Logic
   Dynamic Package Rendering, Filters, WhatsApp Integrations, Light/Dark Theme
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Constants & Dynamic Settings
  let currentWhatsappNumber = "918072812071";

  // State
  let activeFilter = "all";
  let searchQuery = "";
  let activePackages = [];

  // DOM Elements
  const tourGrid = document.getElementById("tourGrid");
  const searchInput = document.getElementById("packageSearch");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const header = document.getElementById("header");
  const navLinks = document.querySelectorAll(".nav-link");

  // Modal DOM Elements
  const detailModal = document.getElementById("detailModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const modalBookBtn = document.getElementById("modalBookBtn");
  
  const modalImg = document.getElementById("modalImg");
  const modalCategory = document.getElementById("modalCategory");
  const modalTourName = document.getElementById("modalTourName");
  const modalSummary = document.getElementById("modalSummary");
  const modalDuration = document.getElementById("modalDuration");
  const modalType = document.getElementById("modalType");
  const modalPrice = document.getElementById("modalPrice");
  
  const modalTabButtons = document.querySelectorAll(".modal-tab-btn");
  const modalTabPanes = document.querySelectorAll(".modal-tab-pane");
  const modalItineraryList = document.getElementById("modalItineraryList");
  const modalHighlightsList = document.getElementById("modalHighlightsList");
  const modalInclusionsList = document.getElementById("modalInclusionsList");
  const modalExclusionsList = document.getElementById("modalExclusionsList");

  // Theme Toggle Elements
  const themeToggleBtn = document.getElementById("themeToggleBtn");

  // Form DOM Element
  const enquiryForm = document.getElementById("enquiryForm");

  // --- Theme Toggle Logic ---
  const currentTheme = localStorage.getItem("theme") || "dark";
  if (currentTheme === "light") {
    document.body.classList.add("light-mode");
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-mode");
      const theme = document.body.classList.contains("light-mode") ? "light" : "dark";
      localStorage.setItem("theme", theme);
      showToast(`Switched to ${theme} mode!`, "success");
    });
  }

  // Format currency
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(amount || 0));
  };

  // Render Tour Card HTML
  function createTourCard(item) {
    const durationLabel = item.region === "oneday" ? "1 Day" : "2 Days";
    
    // Create highlights tags (take first 3)
    const tagsHTML = item.highlights.slice(0, 3).map(tag => `<span class="tour-tag">${tag}</span>`).join("");

    return `
      <article class="tour-card" data-id="${item.id}">
        <div class="tour-img-container">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
          <span class="tour-badge">${item.type}</span>
          <span class="tour-duration">${durationLabel}</span>
        </div>
        <div class="tour-body">
          <h3>${item.title}</h3>
          <p class="tour-summary">${item.summary}</p>
          <div class="tour-tags">
            ${tagsHTML}
          </div>
          <div class="tour-footer">
            <div class="tour-price-box">
              <span>Per Person Starting</span>
              <strong>${formatPrice(item.price)}</strong>
            </div>
            <button class="btn btn-secondary view-details-btn" style="padding: 8px 18px; font-size: 0.85rem;">Details &rarr;</button>
          </div>
        </div>
      </article>
    `;
  }

  // Render Grid Packages
  function renderPackages() {
    if (!tourGrid) return;

    // Filter packages
    const filtered = activePackages.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (activeFilter === "all") return true;
      return item.region === activeFilter;
    });

    // Populate Grid
    if (filtered.length > 0) {
      tourGrid.innerHTML = filtered.map(createTourCard).join("");
      
      // Re-attach view details event listeners
      document.querySelectorAll(".view-details-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const card = e.target.closest(".tour-card");
          const packageId = card.dataset.id;
          openPackageModal(packageId);
        });
      });
    } else {
      tourGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--text-gray);">
          <span style="font-size: 3rem; display: block; margin-bottom: 15px;">🔍</span>
          <h3>No packages match your search</h3>
          <p style="margin-top: 10px; font-size: 0.95rem;">Try typing another destination or selecting a different tab.</p>
        </div>
      `;
    }
  }

  // Filter Handler
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      activeFilter = btn.dataset.filter;
      renderPackages();
    });
  });

  // Search Handler
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderPackages();
    });
  }

  // Navigation Mobile Menu Toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      navToggle.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Close Mobile Menu on Nav Item Click
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Header Scroll Sticky style
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Scroll Spy for Nav Links active state
    let fromTop = window.scrollY + 100;
    navLinks.forEach(link => {
      let section = document.querySelector(link.hash);
      if (
        section &&
        section.offsetTop <= fromTop &&
        section.offsetTop + section.offsetHeight > fromTop
      ) {
        navLinks.forEach(n => n.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });

  // Modal Tab switching logic
  modalTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      modalTabButtons.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      modalTabPanes.forEach(p => p.classList.remove("active"));
      
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      
      const targetPane = document.getElementById(`pane-${btn.dataset.modalTab}`);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // Open Details Modal
  function openPackageModal(packageId) {
    const item = activePackages.find(p => p.id === packageId);
    if (!item) return;

    // Fill Basic Details
    modalImg.src = item.image;
    modalImg.alt = item.title;
    modalCategory.textContent = `${item.destination} Package`;
    modalTourName.textContent = item.title;
    modalSummary.textContent = item.summary;
    modalDuration.textContent = item.days;
    modalType.textContent = item.type;
    modalPrice.textContent = formatPrice(item.price);

    // Fill lists helper
    const buildListHTML = (list, prefix = "") => 
      list.map(line => `<li>${prefix}${line}</li>`).join("");

    // Populate Tab Content Lists
    modalItineraryList.innerHTML = buildListHTML(item.itinerary);
    modalHighlightsList.innerHTML = buildListHTML(item.highlights);
    modalInclusionsList.innerHTML = buildListHTML(item.inclusions);
    modalExclusionsList.innerHTML = buildListHTML(item.exclusions);

    // Setup Book Button link
    const targetWa = (currentWhatsappNumber || "918072812071").replace(/[^0-9]/g, "");
    const safeWa = targetWa || "918072812071";
    const waText = encodeURIComponent(`Hi GK Holidays,\n\nI am interested in booking the tour package:\n📌 *${item.title}*\n⏱️ *Duration:* ${item.days}\n💰 *Price:* ${formatPrice(item.price)} per person.\n\nPlease share travel dates, slot availability, and booking guidelines. Thank you!`);
    modalBookBtn.href = `https://wa.me/${safeWa}?text=${waText}`;

    // Reset Modal Tab to Itinerary
    modalTabButtons.forEach(b => b.classList.remove("active"));
    modalTabPanes.forEach(p => p.classList.remove("active"));
    modalTabButtons[0].classList.add("active");
    modalTabPanes[0].classList.add("active");

    // Open Modal
    detailModal.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent body scroll
  }

  // Close Modal
  function closePackageModal() {
    detailModal.classList.remove("open");
    document.body.style.overflow = ""; // Restore body scroll
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closePackageModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener("click", closePackageModal);
  
  // Close Modal when clicking outside content
  if (detailModal) {
    detailModal.addEventListener("click", (e) => {
      if (e.target === detailModal) {
        closePackageModal();
      }
    });
  }

  // Collapsible FAQ Accordion
  const faqQuestions = document.querySelectorAll(".faq-question-btn");
  faqQuestions.forEach(btn => {
    btn.addEventListener("click", () => {
      const faqItem = btn.parentElement;
      const isOpen = faqItem.classList.contains("open");
      
      // Close all FAQs first
      document.querySelectorAll(".faq-item").forEach(item => {
        item.classList.remove("open");
        item.querySelector(".faq-question-btn").setAttribute("aria-expanded", "false");
      });
      
      if (!isOpen) {
        faqItem.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Contact / Enquiry Form Submit Redirect to WhatsApp
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const tripCategory = document.getElementById("formType").value;
      const fullName = document.getElementById("formName").value.trim();
      const phoneNumber = document.getElementById("formPhone").value.trim();
      const details = document.getElementById("formDetails").value.trim();

      if (!tripCategory || !fullName || !phoneNumber) {
        showToast("Please fill all the required fields.", "error");
        return;
      }

      // Generate WhatsApp message content
      const targetNumber = (currentWhatsappNumber || "918072812071").replace(/[^0-9]/g, "");
      const safeTarget = targetNumber || "918072812071";
      const msg = `Hi GK Holidays,\n\nI have submitted an enquiry from the website:\n\n👤 *Name:* ${fullName}\n📞 *Phone:* ${phoneNumber}\n✈️ *Interested Category:* ${tripCategory}\n📝 *Details:* ${details || "N/A"}\n\nPlease get in touch. Thank you!`;
      const finalUrl = `https://wa.me/${safeTarget}?text=${encodeURIComponent(msg)}`;

      showToast("Redirecting to WhatsApp (+91 8072 812 071)...", "success");

      // Open directly to prevent popup blocking
      const win = window.open(finalUrl, "_blank");
      if (!win || win.closed || typeof win.closed === "undefined") {
        window.location.href = finalUrl;
      }
      enquiryForm.reset();
    });
  }

  // Custom Toast Notification System
  function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);
    
    // Trigger transition Reflow
    void toast.offsetWidth;
    toast.classList.add("show");

    // Remove toast after duration
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  // Load packages dynamically from backend API
  async function loadPackages() {
    try {
      const res = await fetch("/api/packages");
      if (res.ok) {
        activePackages = await res.json();
      } else {
        activePackages = typeof tourPackages !== "undefined" ? tourPackages : [];
      }
    } catch (e) {
      console.error("Failed to fetch packages", e);
      activePackages = typeof tourPackages !== "undefined" ? tourPackages : [];
    }
    renderPackages();
  }

  // Load settings dynamically from backend API
  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      const settings = await res.json();

      if (settings.whatsapp) {
        currentWhatsappNumber = settings.whatsapp.replace(/[^0-9]/g, "");
      }
      if (!currentWhatsappNumber) {
        currentWhatsappNumber = "918072812071";
      }

      // Update Contact Address
      const contactAddr = document.getElementById("contactAddress");
      if (contactAddr && settings.address) {
        contactAddr.textContent = settings.address;
      }
      const footerAddr = document.getElementById("footerAddress");
      if (footerAddr && settings.address) {
        footerAddr.textContent = settings.address;
      }

      // Update Phone numbers list
      if (settings.phoneNumbers && settings.phoneNumbers.length > 0) {
        const contactPhonesList = document.getElementById("contactPhonesList");
        if (contactPhonesList) {
          contactPhonesList.innerHTML = settings.phoneNumbers.map(phone => {
            const rawPhone = phone.replace(/[^0-9+]/g, "");
            return `<p><a href="tel:${rawPhone}">${phone}</a></p>`;
          }).join("");
        }

        const footerPhonesList = document.getElementById("footerPhonesList");
        if (footerPhonesList) {
          footerPhonesList.innerHTML = settings.phoneNumbers.map(phone => {
            const rawPhone = phone.replace(/[^0-9+]/g, "");
            return `<a href="tel:${rawPhone}">${phone}</a>`;
          }).join("<br>");
        }

        // Float call button uses first phone number
        const floatCallBtn = document.getElementById("floatCallBtn");
        if (floatCallBtn) {
          const firstPhone = settings.phoneNumbers[0].replace(/[^0-9+]/g, "");
          floatCallBtn.href = `tel:${firstPhone}`;
        }
      }

      // Update Email links
      if (settings.email) {
        const contactEmail = document.getElementById("contactEmail");
        if (contactEmail) {
          contactEmail.href = `mailto:${settings.email}`;
          contactEmail.textContent = settings.email;
        }
        const footerEmail = document.getElementById("footerEmail");
        if (footerEmail) {
          footerEmail.href = `mailto:${settings.email}`;
          footerEmail.textContent = settings.email;
        }
      }

      // Update Instagram links & handle
      if (settings.instagramHandle) {
        const contactInsta = document.getElementById("contactInstagram");
        if (contactInsta) {
          contactInsta.textContent = settings.instagramHandle;
          if (settings.instagramUrl) contactInsta.href = settings.instagramUrl;
        }
      }

      if (settings.instagramUrl) {
        const footerInstaLink = document.getElementById("footerInstagramLink");
        if (footerInstaLink) {
          footerInstaLink.href = settings.instagramUrl;
        }
      }

      // Update WhatsApp links
      const floatWaBtn = document.getElementById("floatWaBtn");
      if (floatWaBtn) {
        floatWaBtn.href = `https://wa.me/${currentWhatsappNumber}`;
      }
      const footerWaLink = document.getElementById("footerWaLink");
      if (footerWaLink) {
        footerWaLink.href = `https://wa.me/${currentWhatsappNumber}`;
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  }

  // Load feedback reviews dynamically from backend API
  async function loadReviews() {
    const reviewsGrid = document.getElementById("reviewsGrid");
    if (!reviewsGrid) return;

    try {
      const res = await fetch("/api/feedback/public");
      if (!res.ok) throw new Error("Failed to load reviews");
      const reviews = await res.json();
      
      if (reviews.length === 0) {
        reviewsGrid.innerHTML = `<p style="text-align: center; color: var(--text-gray); grid-column: 1 / -1; padding: 40px 0;">No reviews yet. Be the first to leave one!</p>`;
        return;
      }

      const generateStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
      };

      reviewsGrid.innerHTML = reviews.map(fb => {
        const dateStr = new Date(fb.submittedDate).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
        
        return `
          <div class="review-card">
            <div class="review-header">
              <div class="reviewer-info">
                <h4>${escapeHTML(fb.studentName)}</h4>
                <span class="college-name">${escapeHTML(fb.collegeName)}</span>
              </div>
              <span class="review-date">${dateStr}</span>
            </div>
            
            <div class="review-ratings-summary">
              <div class="aspect-rating-display">
                <span class="aspect-label">Food Quality:</span>
                <span class="stars-display" title="${fb.foodRating}/5">${generateStars(fb.foodRating)}</span>
              </div>
              <div class="aspect-rating-display">
                <span class="aspect-label">Transport Comfort:</span>
                <span class="stars-display" title="${fb.travelRating}/5">${generateStars(fb.travelRating)}</span>
              </div>
              <div class="aspect-rating-display">
                <span class="aspect-label">Places Visited:</span>
                <span class="stars-display" title="${fb.placesRating}/5">${generateStars(fb.placesRating)}</span>
              </div>
            </div>
            
            <p class="review-comment">"${escapeHTML(fb.comments || 'Excellent experience traveling with GK Holidays!')}"</p>
          </div>
        `;
      }).join("");

    } catch (e) {
      console.error("Failed to load reviews", e);
      reviewsGrid.innerHTML = `<p style="text-align: center; color: var(--danger); grid-column: 1 / -1; padding: 40px 0;">Failed to load reviews. Please refresh the page.</p>`;
    }
  }

  function escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initial load
  loadPackages();
  loadSettings();
  loadReviews();
});
