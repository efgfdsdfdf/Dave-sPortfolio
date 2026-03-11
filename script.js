// ===== script.js =====
// typing animation, scroll fade, projects + admin (localStorage)

(function() {
  // ----- DEFAULT PROJECTS (normalized categories, no empty tech) -----
  const DEFAULT_PROJECTS = [
    {
      id: '1',
      title: "ACE-Student Companion",
      description: "High‑performance Student Assistant with real‑time inventory updates and an in‑built AI (ACE-AI).",
      problem: "Monolithic platforms struggle with scale and real‑time sync. Needed a decoupled, event‑driven solution.",
      tech: ["HTML", "CSS", "JAVASCRIPT", "Node.js"],  // removed empty string
      architecture: "Modular services: inventory service (Redis pub/sub), order service (ACID), API gateway (rate‑limiting, JWT).",
      category: "fullstack",  // normalized to lowercase
      github: "https://efgfdsdfdf.github.io/edutrack/",
      demo: "https://edutrack-rust.vercel.app/"
    },
    {
      id: '2',
      title: "TECHTITANS",
      description: "An internal system for a company called TECHTITANS, with group discussions and direct messages based on roles.",
      problem: "Remote teams need low‑latency task boards without page reloads.",
      tech: ["React", "TypeScript", "Fastify", "MongoDB", "Socket.io"],
      architecture: "Frontend: state machine (xState) + optimistic updates. Backend: horizontal scaling with Redis adapter for Socket.io",
      category: "backend",  // normalized
      github: "https://efgfdsdfdf.github.io/TECHTITANS/",
      demo: "https://efgfdsdfdf.github.io/TECHTITANS/"
    },
    {
      id: '3',
      title: "ZED",
      description: "ZED is an AI-powered health assistant app that helps users analyze symptoms, track vital signs, and receive intelligent health insights in real time.",
      problem: "Many people don’t understand their health symptoms. ZED provides AI‑powered analysis, vital tracking, and encrypted storage for early health awareness.",
      tech: ["React", "TypeScript", "Fastify", "MongoDB", "Socket.io"],
      architecture: "User → Encrypt → Backend → AI Analysis → Encrypted Storage → User Dashboard. Full end‑to‑end encrypted health monitoring.",
      category: "fullstack",
      github: "https://efgfdsdfdf.github.io/ZED/",
      demo: "https://efgfdsdfdf.github.io/ZED/"
    },
  ];

  // ----- LOCALSTORAGE HELPERS -----
  function getProjects() {
    const stored = localStorage.getItem('portfolio_projects');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_PROJECTS;
      }
    } else {
      // initialize with defaults
      localStorage.setItem('portfolio_projects', JSON.stringify(DEFAULT_PROJECTS));
      return DEFAULT_PROJECTS;
    }
  }

  function saveProjects(projects) {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
  }

  // ----- TYPING ANIMATION (home) -----
  const typedElement = document.querySelector('.typed-role');
  if (typedElement) {
    const phrases = [
      "Fullstack Developer",
      "Backend Architect",
      "API Designer",
      "Frontend Engineer",
      "Real‑time systems builder"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentText = '';

    function type() {
      const fullText = phrases[phraseIndex];
      if (isDeleting) {
        currentText = fullText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        currentText = fullText.substring(0, charIndex + 1);
        charIndex++;
      }

      typedElement.textContent = currentText;

      if (!isDeleting && charIndex === fullText.length) {
        isDeleting = true;
        setTimeout(type, 1800);
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 300);
      } else {
        const speed = isDeleting ? 50 : 100;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // ----- FADE-IN ON SCROLL -----
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.2 });
    fadeElements.forEach(el => observer.observe(el));
  }

  // ----- CONTACT FORM (FormSubmit AJAX) -----
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('submit-btn');
      const statusDiv = document.getElementById('form-status');
      const formData = new FormData(contactForm);

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      statusDiv.textContent = '';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          statusDiv.textContent = '✅ Message sent successfully! I’ll get back to you soon.';
          contactForm.reset();
        } else {
          statusDiv.textContent = result.message || '❌ Something went wrong. Please try again.';
        }
      } catch (error) {
        statusDiv.textContent = '❌ Network error – please check your connection.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message →';
      }
    });
  }

  // ----- RENDER FEATURED PROJECTS (index.html) -----
  const featuredGrid = document.getElementById('featured-projects-grid');
  if (featuredGrid) {
    const projects = getProjects();
    const featured = projects.slice(0, 3);
    featuredGrid.innerHTML = featured.map(p => `
      <article class="project-card">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-tech">
          ${p.tech.filter(t => t.trim() !== '').map(t => `<span>${t}</span>`).join('')}
        </div>
        <a href="projects.html" class="card-link">View details →</a>
      </article>
    `).join('');
  }

  // ----- PROJECTS PAGE: render with filter (case‑insensitive) -----
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    const projects = getProjects();

    function renderProjects(filter = 'all') {
      const filtered = filter === 'all' 
        ? projects 
        : projects.filter(p => p.category.toLowerCase() === filter.toLowerCase()); // case‑insensitive
      const html = filtered.map(p => `
        <article class="project-card detail-card">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc"><strong>Description:</strong> ${p.description}</p>
          <p class="project-problem"><strong>Problem:</strong> ${p.problem}</p>
          <div class="project-tech">
            ${p.tech.filter(t => t.trim() !== '').map(t => `<span>${t}</span>`).join('')}
          </div>
          <p class="project-arch"><strong>Architecture:</strong> ${p.architecture}</p>
          <div class="project-links" style="margin-top: 16px; display: flex; gap: 24px;">
            <a href="${p.github}" class="card-link" target="_blank" rel="noopener">See Project →</a>
            <a href="${p.demo}" class="card-link" target="_blank" rel="noopener">Live demo →</a>
          </div>
        </article>
      `).join('');
      projectsGrid.innerHTML = html || '<p style="color:var(--text-secondary); grid-column:1/-1;">No projects in this category.</p>';
    }

    renderProjects('all');

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProjects(btn.dataset.filter);
      });
    });
  }

  // ----- ADMIN PANEL (admin.html) -----
  const unlockBtn = document.getElementById('unlockBtn');
  const passwordWrapper = document.getElementById('passwordWrapper');
  const adminPanel = document.getElementById('adminPanel');

  if (unlockBtn && passwordWrapper && adminPanel) {
    // Track if admin interface has been initialized
    let adminInitialized = false;

    unlockBtn.addEventListener('click', () => {
      const pass = document.getElementById('adminPass').value;
      if (pass === 'dev123') { // change this in production
        passwordWrapper.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        if (!adminInitialized) {
          initAdmin();
          adminInitialized = true;
        }
      } else {
        alert('Incorrect password');
      }
    });

    function initAdmin() {
      // State for editing
      let editingId = null;

      const addBtn = document.getElementById('addProjectBtn');
      const resetBtn = document.getElementById('resetDefaultsBtn');
      const projectListDiv = document.getElementById('projectList');
      const formStatus = document.createElement('div');
      formStatus.id = 'adminFormStatus';
      formStatus.style.marginTop = '8px';
      formStatus.style.color = 'var(--accent)';
      document.querySelector('.admin-form').appendChild(formStatus);

      // Load and render projects
      function loadAndRender() {
        const projects = getProjects();
        renderProjectList(projects);
      }

      // Render the list of projects with edit/delete
      function renderProjectList(projects) {
        projectListDiv.innerHTML = projects.map(p => `
          <div class="project-item" data-id="${p.id}">
            <div>
              <strong style="color:var(--accent);">${p.title}</strong> 
              <span style="color:var(--text-secondary);">(${p.category})</span>
            </div>
            <div class="project-actions">
              <button class="edit-btn" data-id="${p.id}">✎ Edit</button>
              <button class="delete-btn" data-id="${p.id}">🗑 Delete</button>
            </div>
          </div>
        `).join('');

        // Attach delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.target.dataset.id;
            let projects = getProjects();
            projects = projects.filter(p => p.id !== id);
            saveProjects(projects);
            renderProjectList(projects);
            // If the deleted project was being edited, clear the form
            if (editingId === id) {
              clearForm();
            }
          });
        });

        // Attach edit handlers
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = e.target.dataset.id;
            const projects = getProjects();
            const project = projects.find(p => p.id === id);
            if (project) {
              fillFormForEdit(project);
            }
          });
        });
      }

      // Fill form with project data for editing
      function fillFormForEdit(project) {
        document.getElementById('title').value = project.title || '';
        document.getElementById('desc').value = project.description || '';
        document.getElementById('problem').value = project.problem || '';
        document.getElementById('tech').value = (project.tech || []).join(', ');
        document.getElementById('arch').value = project.architecture || '';
        document.getElementById('category').value = project.category || 'fullstack';
        document.getElementById('github').value = project.github || '#';
        document.getElementById('demo').value = project.demo || '#';

        editingId = project.id;
        addBtn.textContent = 'Update Project';
        formStatus.textContent = 'Editing project. Click Update to save changes.';
      }

      // Clear the form and reset to add mode
      function clearForm() {
        document.getElementById('title').value = '';
        document.getElementById('desc').value = '';
        document.getElementById('problem').value = '';
        document.getElementById('tech').value = '';
        document.getElementById('arch').value = '';
        document.getElementById('github').value = '#';
        document.getElementById('demo').value = '#';
        editingId = null;
        addBtn.textContent = 'Add Project';
        formStatus.textContent = '';
      }

      // Generate a unique ID
      function generateId() {
        return (window.crypto && window.crypto.randomUUID) 
          ? crypto.randomUUID() 
          : Date.now().toString(36) + Math.random().toString(36).substring(2);
      }

      // Add or update project
      function handleAddOrUpdate() {
        const title = document.getElementById('title').value.trim();
        const desc = document.getElementById('desc').value.trim();
        const problem = document.getElementById('problem').value.trim();
        const techStr = document.getElementById('tech').value.trim();
        const arch = document.getElementById('arch').value.trim();
        const category = document.getElementById('category').value;
        const github = document.getElementById('github').value.trim() || '#';
        const demo = document.getElementById('demo').value.trim() || '#';

        if (!title || !desc || !problem || !techStr || !arch) {
          alert('Please fill all fields');
          return;
        }

        const tech = techStr.split(',').map(s => s.trim()).filter(s => s !== '');
        let projects = getProjects();

        if (editingId) {
          // Update existing project
          const index = projects.findIndex(p => p.id === editingId);
          if (index !== -1) {
            projects[index] = {
              ...projects[index],
              title,
              description: desc,
              problem,
              tech,
              architecture: arch,
              category,
              github,
              demo
            };
            formStatus.textContent = '✅ Project updated.';
          }
        } else {
          // Add new project
          const newProject = {
            id: generateId(),
            title,
            description: desc,
            problem,
            tech,
            architecture: arch,
            category,
            github,
            demo
          };
          projects.push(newProject);
          formStatus.textContent = '✅ Project added.';
        }

        saveProjects(projects);
        renderProjectList(projects);
        clearForm();
      }

      // Reset to default projects
      function handleReset() {
        if (confirm('Restore default projects? This will overwrite your current list.')) {
          saveProjects(DEFAULT_PROJECTS);
          loadAndRender();
          clearForm();
        }
      }

      // Attach event listeners
      addBtn.addEventListener('click', handleAddOrUpdate);
      resetBtn.addEventListener('click', handleReset);

      // Optional: Add cancel edit button (can be added to HTML)
      // For simplicity, we'll add a small "Cancel" link next to the form
      const cancelEdit = document.createElement('button');
      cancelEdit.textContent = 'Cancel Edit';
      cancelEdit.type = 'button';
      cancelEdit.style.marginLeft = '8px';
      cancelEdit.addEventListener('click', clearForm);
      addBtn.parentNode.insertBefore(cancelEdit, addBtn.nextSibling);

      // Initial render
      loadAndRender();
    }
  }
})();
