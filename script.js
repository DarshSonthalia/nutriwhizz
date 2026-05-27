const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const supabaseUrl = "https://angcbfhygtgvzdwoegua.supabase.co";
const supabaseAnonKey = "sb_publishable_A1Jnv6ge6Nn3PUreFNyOLw_sDLAMyfH";
const isSupabaseConfigured = !supabaseUrl.includes("YOUR-PROJECT") && !supabaseAnonKey.includes("YOUR_PUBLIC");
const supabaseClient =
  isSupabaseConfigured && window.supabase
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (window.lucide) {
  window.lucide.createIcons();
}

const updateHeader = () => {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });
}

if (nav && navToggle) {
  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.innerHTML = '<i data-lucide="menu"></i>';
      if (window.lucide) {
        window.lucide.createIcons();
      }
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) {
      return;
    }

    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== detail) {
        other.removeAttribute("open");
      }
    });
  });
});

document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    const originalText = button.textContent;
    button.textContent = "Checklist request received";
    button.disabled = true;

    window.setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      event.currentTarget.reset();
    }, 2600);
  });
});

document.querySelectorAll("[data-consultation-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = form.querySelector("[data-form-status]");
    const button = form.querySelector("button");
    const originalText = button.textContent;
    const data = Object.fromEntries(new FormData(form).entries());

    button.disabled = true;
    button.textContent = "Submitting...";
    status.textContent = "";

    if (!supabaseClient) {
      status.textContent = "Supabase is ready to connect. Add your project URL and anon key in script.js.";
      button.disabled = false;
      button.textContent = originalText;
      return;
    }

    const { error } = await supabaseClient.from("consultation_requests").insert({
      parent_name: data.parent_name,
      child_name: data.child_name,
      child_age: data.child_age,
      email: data.email,
      phone: data.phone,
      city: data.city,
      concern: data.concern,
      page: window.location.pathname,
    });

    if (error) {
      status.textContent = `Supabase error: ${error.message}`;
      button.disabled = false;
      button.textContent = originalText;
      return;
    }

    status.textContent = "Thank you. Your consultation request has been received.";
    button.textContent = "Request Submitted";
    form.reset();

    window.setTimeout(() => {
      button.disabled = false;
      button.textContent = originalText;
    }, 2800);
  });
});
