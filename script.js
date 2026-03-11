// ===== script.js =====
// typing animation, scroll fade, projects + admin (Supabase) – robust & error‑free

(function() {
  // ----- SAFE SUPABASE INITIALIZATION (no crashes) -----
  let supabase = null;
  try {
    // Check if the Supabase library is loaded globally
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      const SUPABASE_URL = 'https://qrfgrfflkpudefcsbndn.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyZmdyZmZsa3B1ZGVmY3NibmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzE0NDQsImV4cCI6MjA4ODgwNzQ0NH0.CzTNuVWK2d9cwvAqSfE4IT2j3N14DORnpCqL__Z-Gdw';
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase initialized.');
    } else {
      console.warn('⚠️ Supabase library not loaded. Supabase features disabled.');
    }
  } catch (e) {
    console.error('❌ Supabase initialization failed:', e);
  }

  // ----- DEFAULT PROJECTS (used only for seeding) -----
  const DEFAULT_PROJECTS = [
    {
      title: "ACE-Student Companion",
      description: "High‑performance Student Assistant with real‑time inventory updates and an in‑built AI (ACE-AI).",
      problem: "Monolithic platforms struggle with scale and real‑time sync. Needed a decoupled, event‑driven solution.",
      tech: ["HTML", "CSS", "JAVASCRIPT", "Node.js"],
      architecture: "Modular services: inventory service (Redis pub/sub), order service (ACID), API gateway (rate‑limiting, JWT).",
      category: "fullstack",
      github: "https://efgfdsdfdf.github.io/edutrack/",
      demo: "https://edutrack-rust.vercel.app/"
    },
    {
      title: "TECHTITANS",
      description: "An internal system for a company called TECHTITANS, with group discussions and direct messages based on roles.",
      problem: "Remote teams need low‑latency task boards without page reloads.",
      tech: ["React", "TypeScript", "Fastify", "MongoDB", "Socket.io"],
      architecture: "Frontend: state machine (xState) + optimistic updates. Backend: horizontal scaling with Redis adapter for Socket.io",
      category: "backend",
      github: "https://efgfdsdfdf.github.io/TECHTITANS/",
      demo: "https://efgfdsdfdf.github.io/TECHTITANS/"
    },
    {
      title: "ZED",
      description: "AI-powered health assistant that analyzes symptoms, tracks vital signs, and provides intelligent health insights.",
      problem: "Many people don’t understand their health symptoms. ZED provides AI‑powered analysis, vital tracking, and encrypted storage for early health awareness.",
      tech: ["React", "TypeScript", "Fastify", "MongoDB", "Socket.io"],
      architecture: "User → Encrypt → Backend → AI Analysis → Encrypted Storage → User Dashboard. Full end‑to‑end encrypted health monitoring.",
      category: "fullstack",
      github: "https://efgfdsdfdf.github.io/ZED/",
      demo: "https://efgfdsdfdf.github.io/ZED/"
    }
  ];

  // ----- SEED DATABASE IF EMPTY (only if supabase available) -----
  async function seedIfEmpty() {
    if (!supabase) return;
    try {
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      if (count === 0) {
        console.log('🌱 Seeding default projects...');
        const { error: insertError } = await supabase.from('projects').insert(DEFAULT_PROJECTS);
        if (insertError) throw insertError;
        console.log('✅ Seeding successful.');
      }
    } catch (e) {
      console.error('❌ Seeding failed:', e);
    }
  }

  // Call seeding (non‑blocking)
  if (supabase) seedIfEmpty();

  // ========== FEATURES THAT ALWAYS WORK ==========

  // ----- TYPING ANIMATION -----
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

  // ----- CONTACT FORM (FormSubmit) -----
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

  // ========== SUPABASE‑DEPENDENT FEATURES ==========
  // (only run if supabase is available)

  // ----- FEATURED PROJECTS (index.html) -----
  const featuredGrid = document.getElementById('featured-projects-grid');
  if (featuredGrid) {
    if (!supabase) {
      featuredGrid.innerHTML = '<p style="color:var(--text-secondary);">⚠️ Supabase not available.</p>';
    } else {
      async function loadFeatured() {
        try {
          const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .limit(3);
          if (error) throw error;
          featuredGrid.innerHTML = projects.map(p => `
            <article class="project-card">
              <h3 class="project-title">${escapeHtml(p.title)}</h3>
              <p class="project-desc">${escapeHtml(p.description)}</p>
              <div class="project-tech">
                ${p.tech.filter(t => t.trim()).map(t => `<span>${escapeHtml(t)}</span>`).join('')}
              </div>
              <a href="projects.html" class="card-link">View details →</a>
            </article>
          `).join('');
        } catch (e) {
          console.error('Error loading featured projects:', e);
          featuredGrid.innerHTML = '<p style="color:var(--text-secondary);">Error loading projects.</p>';
        }
      }
      loadFeatured();
    }
  }

  // ----- PROJECTS PAGE (projects.html) -----
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid) {
    if (!supabase) {
      projectsGrid.innerHTML = '<p style="color:var(--text-secondary);">⚠️ Supabase not available.</p>';
    } else {
      async function renderProjects(filter = 'all') {
        try {
          let query = supabase.from('projects').select('*');
          if (filter !== 'all') {
            query = query.eq('category', filter.toLowerCase());
          }
          const { data: projects, error } = await query;
          if (error) throw error;
          const html = projects.map(p => `
            <article class="project-card detail-card">
              <h3 class="project-title">${escapeHtml(p.title)}</h3>
              <p class="project-desc"><strong>Description:</strong> ${escapeHtml(p.description)}</p>
              <p class="project-problem"><strong>Problem:</strong> ${escapeHtml(p.problem)}</p>
              <div class="project-tech">
                ${p.tech.filter(t => t.trim()).map(t => `<span>${escapeHtml(t)}</span>`).join('')}
              </div>
              <p class="project-arch"><strong>Architecture:</strong> ${escapeHtml(p.architecture)}</p>
              <div class="project-links" style="margin-top: 16px; display: flex; gap: 24px;">
                <a href="${escapeHtml(p.github)}" class="card-link" target="_blank" rel="noopener">See Project →</a>
                <a href="${escapeHtml(p.demo)}" class="card-link" target="_blank" rel="noopener">Live demo →</a>
              </div>
            </article>
          `).join('');
          projectsGrid.innerHTML = html || '<p style="color:var(--text-secondary); grid-column:1/-1;">No projects in this category.</p>';
        } catch (e) {
          console.error('Error loading projects:', e);
          projectsGrid.innerHTML = '<p style="color:var(--text-secondary);">Error loading projects.</p>';
        }
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
  }

  // ----- ADMIN PANEL (admin.html) -----
  const unlockBtn = document.getElementById('unlockBtn');
  const passwordWrapper = document.getElementById('passwordWrapper');
  const adminPanel = document.getElementById('adminPanel');

  if (unlockBtn && passwordWrapper && adminPanel) {
    if (!supabase) {
      passwordWrapper.innerHTML = '<p style="color:red;">❌ Supabase not available. Admin disabled.</p>';
    } else {
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

      async function initAdmin() {
        let editingId = null;

        const addBtn = document.getElementById('addProjectBtn');
        const resetBtn = document.getElementById('resetDefaultsBtn');
        const projectListDiv = document.getElementById('projectList');
        const formStatus = document.getElementById('adminFormStatus') || (() => {
          const div = document.createElement('div');
          div.id = 'adminFormStatus';
          div.style.marginTop = '8px';
          div.style.color = 'var(--accent)';
          document.querySelector('.admin-form').appendChild(div);
          return div;
        })();

        async function loadAndRender() {
          try {
            const { data: projects, error } = await supabase.from('projects').select('*');
            if (error) throw error;
            renderProjectList(projects);
          } catch (e) {
            console.error('Error loading projects:', e);
            projectListDiv.innerHTML = '<p style="color:red;">Failed to load projects.</p>';
          }
        }

        function renderProjectList(projects) {
          projectListDiv.innerHTML = projects.map(p => `
            <div class="project-item" data-id="${escapeHtml(p.id)}">
              <div>
                <strong style="color:var(--accent);">${escapeHtml(p.title)}</strong> 
                <span style="color:var(--text-secondary);">(${escapeHtml(p.category)})</span>
              </div>
              <div class="project-actions">
                <button class="edit-btn" data-id="${escapeHtml(p.id)}">✎ Edit</button>
                <button class="delete-btn" data-id="${escapeHtml(p.id)}">🗑 Delete</button>
              </div>
            </div>
          `).join('');

          document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const id = e.target.dataset.id;
              if (confirm('Are you sure?')) {
                try {
                  const { error } = await supabase.from('projects').delete().eq('id', id);
                  if (error) throw error;
                  loadAndRender();
                  if (editingId === id) clearForm();
                } catch (e) {
                  alert('Delete failed: ' + e.message);
                }
              }
            });
          });

          document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const id = e.target.dataset.id;
              try {
                const { data: project, error } = await supabase.from('projects').select('*').eq('id', id).single();
                if (error) throw error;
                fillFormForEdit(project);
              } catch (e) {
                alert('Error loading project: ' + e.message);
              }
            });
          });
        }

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

        function normalizeUrl(url) {
          if (!url || url === '#') return '#';
          if (!url.match(/^[a-zA-Z]+:\/\//)) return 'https://' + url;
          return url;
        }

        async function handleAddOrUpdate() {
          const title = document.getElementById('title').value.trim();
          const desc = document.getElementById('desc').value.trim();
          const problem = document.getElementById('problem').value.trim();
          const techStr = document.getElementById('tech').value.trim();
          const arch = document.getElementById('arch').value.trim();
          const category = document.getElementById('category').value;
          let github = document.getElementById('github').value.trim() || '#';
          let demo = document.getElementById('demo').value.trim() || '#';

          if (!title || !desc || !problem || !techStr || !arch) {
            alert('Please fill all fields');
            return;
          }

          github = normalizeUrl(github);
          demo = normalizeUrl(demo);
          const tech = techStr.split(',').map(s => s.trim()).filter(s => s);

          const projectData = {
            title,
            description: desc,
            problem,
            tech,
            architecture: arch,
            category,
            github,
            demo
          };

          try {
            let error;
            if (editingId) {
              ({ error } = await supabase.from('projects').update(projectData).eq('id', editingId));
              if (!error) formStatus.textContent = '✅ Project updated.';
            } else {
              ({ error } = await supabase.from('projects').insert([projectData]));
              if (!error) formStatus.textContent = '✅ Project added.';
            }
            if (error) throw error;
            loadAndRender();
            clearForm();
          } catch (e) {
            alert('Operation failed: ' + e.message);
          }
        }

        async function handleReset() {
          if (confirm('Restore default projects? This will replace all current projects.')) {
            try {
              const { error: deleteError } = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
              if (deleteError) throw deleteError;
              const { error: insertError } = await supabase.from('projects').insert(DEFAULT_PROJECTS);
              if (insertError) throw insertError;
              loadAndRender();
              clearForm();
            } catch (e) {
              alert('Reset failed: ' + e.message);
            }
          }
        }

        addBtn.addEventListener('click', handleAddOrUpdate);
        resetBtn.addEventListener('click', handleReset);

        const cancelEdit = document.createElement('button');
        cancelEdit.textContent = 'Cancel Edit';
        cancelEdit.type = 'button';
        cancelEdit.style.marginLeft = '8px';
        cancelEdit.addEventListener('click', clearForm);
        addBtn.parentNode.insertBefore(cancelEdit, addBtn.nextSibling);

        loadAndRender();
      }
    }
  }

  // ----- Helper: escape HTML -----
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
