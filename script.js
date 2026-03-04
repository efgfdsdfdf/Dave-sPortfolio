// ===== script.js =====
// typing animation, scroll fade, projects + admin (localStorage)

(function() {
  // ----- DEFAULT PROJECTS (used as fallback and reset) -----
      const DEFAULT_PROJECTS = [
        {
          id: '1',
          title: "ACE-Student Companion",
          description: "High‑performance Student Assistant with real‑time inventory updates And an in built AI (ACE-AI).",
          problem: "Monolithic platforms struggle with scale and real‑time sync. Needed a decoupled, event‑driven solution.",
          tech: ["HTML", "CSS", "JAVASCRIPT", "Node.js", ""],
          architecture: "Modular services: inventory service (Redis pub/sub), order service (ACID), API gateway (rate‑limiting, JWT).",
          category: "FULLSTACK",
          github: "https://efgfdsdfdf.github.io/edutrack/",
          demo: "https://edutrack-rust.vercel.app/"
        },
        {
          id: '2',
          title: "TECHTITANS",
          description: "AN internal system for a Company called TECHTITANS, where they have group Discussions and direct messages based on their roles, .",
          problem: "Remote teams need low‑latency task boards without page reloads.",
          tech: ["React", "TypeScript", "Fastify", "MongoDB", "Socket.io"],
          architecture: "Frontend: state machine (xState) + optimistic updates. Backend: horizontal scaling with Redis adapter for Socket.i",
          category: "Backend",
          github: "https://efgfdsdfdf.github.io/TECHTITANS/",
          demo: "https://efgfdsdfdf.github.io/TECHTITANS/"
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
    const featured = projects.slice(0, 3); // first three
    featuredGrid.innerHTML = featured.map(p => `
      <article class="project-card">
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-tech">
          ${p.tech.map(t => `<span>${t}</span>`).join('')}
        </div>
        <a href="projects.html" class="card-link">View details →</a>
      </article>
    `).join('');
  }

  // ----- PROJECTS PAGE: render with filter -----
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    const projects = getProjects();

    function renderProjects(filter = 'all') {
      const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);
      const html = filtered.map(p => `
        <article class="project-card detail-card">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc"><strong>Description:</strong> ${p.description}</p>
          <p class="project-problem"><strong>Problem:</strong> ${p.problem}</p>
          <div class="project-tech">
            ${p.tech.map(t => `<span>${t}</span>`).join('')}
          </div>
          <p class="project-arch"><strong>Architecture:</strong> ${p.architecture}</p>
          <div class="project-links" style="margin-top: 16px; display: flex; gap: 24px;">
            <a href="${p.github}" class="card-link" target="_blank" rel="noopener">GitHub →</a>
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
    // simple password check (hardcoded for demo)
    unlockBtn.addEventListener('click', () => {
      const pass = document.getElementById('adminPass').value;
      if (pass === 'dev123') { // you can change this
        passwordWrapper.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        loadAdminProjects();
      } else {
        alert('Incorrect password');
      }
    });

    function loadAdminProjects() {
      const projects = getProjects();
      const listDiv = document.getElementById('projectList');
      renderProjectList(projects);

      // Add project
      document.getElementById('addProjectBtn').addEventListener('click', () => {
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

        const tech = techStr.split(',').map(s => s.trim()).filter(s => s);
        const newProject = {
          id: Date.now().toString(),
          title,
          description: desc,
          problem,
          tech,
          architecture: arch,
          category,
          github,
          demo
        };

        const updated = [...getProjects(), newProject];
        saveProjects(updated);
        renderProjectList(updated);
        // clear form
        document.getElementById('title').value = '';
        document.getElementById('desc').value = '';
        document.getElementById('problem').value = '';
        document.getElementById('tech').value = '';
        document.getElementById('arch').value = '';
        document.getElementById('github').value = '#';
        document.getElementById('demo').value = '#';
      });

      // Reset to defaults
      document.getElementById('resetDefaultsBtn').addEventListener('click', () => {
        if (confirm('Restore default projects? This will overwrite your current list.')) {
          saveProjects(DEFAULT_PROJECTS);
          renderProjectList(DEFAULT_PROJECTS);
        }
      });
    }

    function renderProjectList(projects) {
      const listDiv = document.getElementById('projectList');
      listDiv.innerHTML = projects.map(p => `
        <div class="project-item">
          <div>
            <strong style="color:var(--accent);">${p.title}</strong> <span style="color:var(--text-secondary);">(${p.category})</span>
          </div>
          <div class="project-actions">
            <button class="edit-btn" data-id="${p.id}">✎ Edit</button>
            <button class="delete-btn" data-id="${p.id}">🗑 Delete</button>
          </div>
        </div>
      `).join('');

      // attach delete events
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          let projects = getProjects();
          projects = projects.filter(p => p.id !== id);
          saveProjects(projects);
          renderProjectList(projects);
        });
      });

      // attach edit events (simplified: prompt for new values, you can improve)
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.dataset.id;
          let projects = getProjects();
          const project = projects.find(p => p.id === id);
          if (!project) return;

          // very basic edit: prompt for new title (extend as needed)
          const newTitle = prompt('Edit title:', project.title);
          if (newTitle && newTitle.trim()) {
            project.title = newTitle.trim();
            saveProjects(projects);
            renderProjectList(projects);
          }
        });
      });
    }
  }

})();
