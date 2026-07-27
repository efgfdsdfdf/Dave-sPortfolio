(function () {
  const SUPABASE_URL = "https://retnizmmxqffrqmkbbwt.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJldG5pem1teHFmZnJxbWtiYnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNTQ1MjcsImV4cCI6MjEwMDczMDUyN30.naITneJ4BlSI10BupfwtMR2KedDkNPKjknbPcuR_ZDo";
  const STORAGE_KEY = "portfolio_projects";
  const ADMIN_PASSWORD = "dev123";

  const DEFAULT_PROJECTS = [
    {
      title: "ACE Student Companion",
      description: "A student platform that combines utility tools, learning support, and AI-assisted guidance in one smooth experience.",
      problem: "Students needed one workspace for planning, support, and quick access to tools without switching between scattered products.",
      tech: ["HTML", "CSS", "JavaScript", "Node.js"],
      architecture: "A lightweight frontend paired with backend services for student workflows, AI assistance, and structured data management.",
      category: "fullstack",
      github: "https://efgfdsdfdf.github.io/edutrack/",
      demo: "https://edutrack-rust.vercel.app/"
    },
    {
      title: "TechTitans Workspace",
      description: "An internal communication system with role-based discussions, direct messaging, and structured collaboration flows.",
      problem: "The team needed a private communication layer that matched business roles instead of relying on generic chat tools.",
      tech: ["React", "TypeScript", "Fastify", "MongoDB", "Socket.io"],
      architecture: "Realtime messaging with role-aware access, persistent conversations, and a backend designed for team-level coordination.",
      category: "backend",
      github: "https://efgfdsdfdf.github.io/TECHTITANS/",
      demo: "https://efgfdsdfdf.github.io/TECHTITANS/"
    },
    {
      title: "ZED Health Assistant",
      description: "An AI-powered health assistant for symptom analysis, vital tracking, and secure wellness monitoring.",
      problem: "People often struggle to understand symptoms early. ZED aims to offer faster insight and more consistent tracking.",
      tech: ["React", "TypeScript", "Node.js", "AI Integration"],
      architecture: "A secure fullstack flow that collects health signals, processes them through AI logic, and returns insights through a guided dashboard.",
      category: "fullstack",
      github: "https://efgfdsdfdf.github.io/ZED/",
      demo: "https://efgfdsdfdf.github.io/ZED/"
    }
  ];

  const supabaseClient = createSupabaseClient();
  let cachedProjects = [];
  let activeEditId = null;
  let seedPromise = null;

  initReveal();
  initTyping();
  initContactForm();
  initFeaturedProjects();
  initProjectsPage();
  initAdminPanel();
  initSecretDoor();

  function initSecretDoor() {
    const door = document.getElementById("secret-door");
    if (door) {
      door.style.cursor = "pointer";
      let clicks = 0;
      let timer;
      door.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        clicks++;
        clearTimeout(timer);
        if (clicks === 3) {
          window.location.href = "admin.html";
        } else {
          timer = setTimeout(() => { clicks = 0; }, 1000);
        }
      });
    }

    let secretCode = "";
    window.addEventListener("keydown", (e) => {
      secretCode += e.key.toLowerCase();
      if (secretCode.endsWith("admin")) {
        window.location.href = "admin.html";
      }
      if (secretCode.length > 10) secretCode = secretCode.slice(-10);
    });
  }

  function createSupabaseClient() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      return null;
    }

    try {
      return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
      console.error("Supabase initialization failed:", error);
      return null;
    }
  }

  async function getProjects() {
    if (supabaseClient) {
      try {
        await seedIfNeeded();
        const { data, error } = await supabaseClient
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        cachedProjects = sanitizeProjects(data);
        return cachedProjects;
      } catch (error) {
        console.warn("Falling back to local projects:", error);
      }
    }

    return getLocalProjects();
  }

  function getLocalProjects() {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
      cachedProjects = sanitizeProjects(DEFAULT_PROJECTS);
      return cachedProjects;
    }

    try {
      cachedProjects = sanitizeProjects(JSON.parse(stored));
      return cachedProjects;
    } catch (error) {
      cachedProjects = sanitizeProjects(DEFAULT_PROJECTS);
      return cachedProjects;
    }
  }

  async function saveProject(project) {
    const normalizedProject = normalizeProject(project);

    if (supabaseClient) {
      if (activeEditId) {
        const { error } = await supabaseClient
          .from("projects")
          .update(normalizedProject)
          .eq("id", activeEditId);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabaseClient.from("projects").insert([normalizedProject]);

        if (error) {
          throw error;
        }
      }

      return;
    }

    const localProjects = getLocalProjects();

    if (activeEditId) {
      const nextProjects = localProjects.map((item) =>
        item.id === activeEditId ? { ...item, ...normalizedProject, id: activeEditId } : item
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
    } else {
      const nextProjects = [...localProjects, { ...normalizedProject, id: String(Date.now()) }];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
    }
  }

  async function deleteProject(id) {
    if (supabaseClient) {
      const { error } = await supabaseClient.from("projects").delete().eq("id", id);

      if (error) {
        throw error;
      }

      return;
    }

    const nextProjects = getLocalProjects().filter((project) => project.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProjects));
  }

  async function resetProjects() {
    if (supabaseClient) {
      const { error: deleteError } = await supabaseClient
        .from("projects")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        throw deleteError;
      }

      const { error: insertError } = await supabaseClient.from("projects").insert(DEFAULT_PROJECTS);

      if (insertError) {
        throw insertError;
      }

      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROJECTS));
  }

  async function seedIfNeeded() {
    if (!supabaseClient) {
      return;
    }

    if (!seedPromise) {
      seedPromise = (async () => {
        const { count, error } = await supabaseClient
          .from("projects")
          .select("*", { count: "exact", head: true });

        if (error) {
          throw error;
        }

        if (count === 0) {
          const { error: insertError } = await supabaseClient.from("projects").insert(DEFAULT_PROJECTS);

          if (insertError) {
            throw insertError;
          }
        }
      })().catch((error) => {
        seedPromise = null;
        throw error;
      });
    }

    await seedPromise;
  }

  function sanitizeProjects(projects) {
    return (projects || []).map((project, index) => ({
      id: String(project.id || index + 1),
      title: project.title || "Untitled project",
      description: project.description || "",
      problem: project.problem || "",
      architecture: project.architecture || "",
      tech: Array.isArray(project.tech) ? project.tech : splitTech(project.tech),
      category: (project.category || "fullstack").toLowerCase(),
      github: normalizeUrl(project.github || "#"),
      demo: normalizeUrl(project.demo || "#")
    }));
  }

  function normalizeProject(project) {
    return {
      title: project.title.trim(),
      description: project.description.trim(),
      problem: project.problem.trim(),
      architecture: project.architecture.trim(),
      tech: splitTech(project.tech),
      category: project.category.trim().toLowerCase(),
      github: normalizeUrl(project.github.trim() || "#"),
      demo: normalizeUrl(project.demo.trim() || "#")
    };
  }

  function splitTech(value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }

    return String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function normalizeUrl(url) {
    if (!url || url === "#") {
      return "#";
    }

    if (/^[a-zA-Z]+:\/\//.test(url)) {
      return url;
    }

    return `https://${url}`;
  }

  function initTyping() {
    const typedRole = document.querySelector(".typed-role");

    if (!typedRole) {
      return;
    }

    const phrases = [
      "backend systems",
      "clean APIs",
      "reliable fullstack products",
      "realtime application flows"
    ];

    let phraseIndex = 0;
    let letterIndex = 0;
    let deleting = false;

    function tick() {
      const phrase = phrases[phraseIndex];

      if (deleting) {
        letterIndex -= 1;
      } else {
        letterIndex += 1;
      }

      typedRole.textContent = phrase.slice(0, letterIndex);

      if (!deleting && letterIndex === phrase.length) {
        deleting = true;
        window.setTimeout(tick, 1400);
        return;
      }

      if (deleting && letterIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }

      window.setTimeout(tick, deleting ? 45 : 80);
    }

    tick();
  }

  function initReveal() {
    const revealItems = document.querySelectorAll(".reveal");

    if (!revealItems.length || !("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");

    if (!form) {
      return;
    }

    const submitButton = document.getElementById("submit-btn");
    const statusNode = document.getElementById("form-status");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      statusNode.textContent = "";

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });

        const payload = await response.json();

        if (response.ok && payload.success) {
          statusNode.textContent = "Message sent successfully. I will get back to you soon.";
          form.reset();
        } else {
          statusNode.textContent = payload.message || "Something went wrong. Please try again.";
        }
      } catch (error) {
        statusNode.textContent = "Network error. Please check your connection and try again.";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send message";
      }
    });
  }

  async function initFeaturedProjects() {
    const featuredGrid = document.getElementById("featured-projects-grid");

    if (!featuredGrid) {
      return;
    }

    const projects = await getProjects();
    const featuredProjects = projects.slice(0, 3);

    if (!featuredProjects.length) {
      featuredGrid.innerHTML = `<div class="empty-state">Projects will appear here once you add them.</div>`;
      return;
    }

    featuredGrid.innerHTML = featuredProjects.map(renderProjectCard).join("");
  }

  async function initProjectsPage() {
    const projectsGrid = document.getElementById("projects-grid");

    if (!projectsGrid) {
      return;
    }

    const projects = await getProjects();
    renderProjectsList(projects, "all");

    document.querySelectorAll(".filter-btn").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        renderProjectsList(projects, button.dataset.filter || "all");
      });
    });
  }

  function renderProjectsList(projects, filter) {
    const projectsGrid = document.getElementById("projects-grid");

    if (!projectsGrid) {
      return;
    }

    const visibleProjects =
      filter === "all" ? projects : projects.filter((project) => project.category === filter);

    if (!visibleProjects.length) {
      projectsGrid.innerHTML = `<div class="empty-state">No projects available in this category yet.</div>`;
      return;
    }

    projectsGrid.innerHTML = visibleProjects
      .map((project) => renderProjectCard(project, true))
      .join("");
  }

  function renderProjectCard(project, detailed) {
    const meta = (project.tech || [])
      .slice(0, detailed ? project.tech.length : 3)
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join("");

    const detailBlock = detailed
      ? `
        <p><strong>Problem:</strong> ${escapeHtml(project.problem)}</p>
        <p><strong>Architecture:</strong> ${escapeHtml(project.architecture)}</p>
      `
      : "";

    return `
      <article class="project-card">
        <p class="project-category">${escapeHtml(project.category)}</p>
        <h3 class="project-title">${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="project-meta">${meta}</div>
        ${detailBlock}
        <div class="project-links">
          <a href="${escapeAttribute(project.github)}" target="_blank" rel="noopener">Code</a>
          <a href="${escapeAttribute(project.demo)}" target="_blank" rel="noopener">Live demo</a>
        </div>
      </article>
    `;
  }

  function initAdminPanel() {
    const unlockButton = document.getElementById("unlockBtn");
    const passwordWrapper = document.getElementById("passwordWrapper");
    const adminPanel = document.getElementById("adminPanel");

    if (!unlockButton || !passwordWrapper || !adminPanel) {
      return;
    }

    unlockButton.addEventListener("click", async () => {
      const passwordInput = document.getElementById("adminPass");

      if (passwordInput.value !== ADMIN_PASSWORD) {
        window.alert("Incorrect password.");
        return;
      }

      passwordWrapper.classList.add("hidden-panel");
      adminPanel.classList.remove("hidden-panel");
      await loadAdminProjects();
    });

    document.getElementById("addProjectBtn").addEventListener("click", handleAdminSave);
    document.getElementById("resetDefaultsBtn").addEventListener("click", handleAdminReset);
  }

  async function loadAdminProjects() {
    const projects = await getProjects();
    renderAdminList(projects);
  }

  function renderAdminList(projects) {
    const projectList = document.getElementById("projectList");

    if (!projectList) {
      return;
    }

    if (!projects.length) {
      projectList.innerHTML = `<div class="empty-state">No projects yet.</div>`;
      return;
    }

    projectList.innerHTML = projects
      .map(
        (project) => `
          <article class="admin-item">
            <div class="admin-item-copy">
              <span class="admin-item-title">${escapeHtml(project.title)}</span>
              <span class="admin-item-meta">${escapeHtml(project.category)} | ${escapeHtml(project.tech.join(", "))}</span>
            </div>
            <div class="admin-item-actions">
              <button type="button" class="edit-btn" data-id="${escapeAttribute(project.id)}">Edit</button>
              <button type="button" class="delete-btn" data-id="${escapeAttribute(project.id)}">Delete</button>
            </div>
          </article>
        `
      )
      .join("");

    projectList.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", () => populateAdminForm(button.dataset.id, projects));
    });

    projectList.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const shouldDelete = window.confirm("Delete this project?");

        if (!shouldDelete) {
          return;
        }

        try {
          await deleteProject(button.dataset.id);
          setAdminStatus("Project deleted.");
          if (activeEditId === button.dataset.id) {
            resetAdminForm();
          }
          await loadAdminProjects();
        } catch (error) {
          console.error(error);
          setAdminStatus("Unable to delete the project right now.", true);
        }
      });
    });
  }

  function populateAdminForm(id, projects) {
    const project = projects.find((item) => item.id === id);

    if (!project) {
      return;
    }

    activeEditId = id;
    document.getElementById("title").value = project.title;
    document.getElementById("desc").value = project.description;
    document.getElementById("problem").value = project.problem;
    document.getElementById("arch").value = project.architecture;
    document.getElementById("tech").value = project.tech.join(", ");
    document.getElementById("category").value = project.category;
    document.getElementById("github").value = project.github;
    document.getElementById("demo").value = project.demo;
    document.getElementById("addProjectBtn").textContent = "Update project";
    setAdminStatus("Editing project. Save when you are done.");
  }

  async function handleAdminSave() {
    const fields = readAdminFields();

    if (!isValidProject(fields)) {
      setAdminStatus("Please fill every field before saving.", true);
      return;
    }

    try {
      await saveProject(fields);
      setAdminStatus(activeEditId ? "Project updated." : "Project added.");
      resetAdminForm();
      await loadAdminProjects();
    } catch (error) {
      console.error(error);
      setAdminStatus("Unable to save the project right now.", true);
    }
  }

  async function handleAdminReset() {
    const shouldReset = window.confirm("Reset your portfolio projects to the default entries?");

    if (!shouldReset) {
      return;
    }

    try {
      await resetProjects();
      resetAdminForm();
      setAdminStatus("Projects reset to defaults.");
      await loadAdminProjects();
    } catch (error) {
      console.error(error);
      setAdminStatus("Unable to reset projects right now.", true);
    }
  }

  function readAdminFields() {
    return {
      title: document.getElementById("title").value,
      description: document.getElementById("desc").value,
      problem: document.getElementById("problem").value,
      architecture: document.getElementById("arch").value,
      tech: document.getElementById("tech").value,
      category: document.getElementById("category").value,
      github: document.getElementById("github").value,
      demo: document.getElementById("demo").value
    };
  }

  function isValidProject(project) {
    return (
      project.title.trim() &&
      project.description.trim() &&
      project.problem.trim() &&
      project.architecture.trim() &&
      splitTech(project.tech).length &&
      project.category.trim()
    );
  }

  function resetAdminForm() {
    activeEditId = null;
    document.getElementById("title").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("problem").value = "";
    document.getElementById("arch").value = "";
    document.getElementById("tech").value = "";
    document.getElementById("category").value = "frontend";
    document.getElementById("github").value = "#";
    document.getElementById("demo").value = "#";
    document.getElementById("addProjectBtn").textContent = "Add project";
  }

  function setAdminStatus(message, isError) {
    const statusNode = document.getElementById("adminFormStatus");

    if (!statusNode) {
      return;
    }

    statusNode.textContent = message;
    statusNode.style.color = isError ? "#a23c2a" : "var(--success)";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
