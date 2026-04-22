/**
 * @fileoverview Contact Management SPA — Main Application
 *
 * Architecture mirrors an Angular app:
 *   ContactListComponent  → left panel (contact-list route component)
 *   ContactDetailsComponent → right panel (contact-details route component)
 *   ContactApp            → root AppComponent / AppModule bootstrapper
 *
 * ASSUMPTION: The spec requires Angular + TypeScript, but the user confirmed
 * direct implementation in index.html. This file uses ES6 class-based OOP,
 * Dependency Injection via constructor params, and Observer-style callbacks
 * to replicate Angular patterns without a build step.
 *
 * SIMPLIFIED:
 *   - Routing: Angular Router would manage /contacts and /contacts/:id URLs.
 *     Here, "routing" is simulated by showing/hiding panel sections.
 *   - Change detection: Angular's zone-based CD is replaced by explicit
 *     render() calls after data mutations.
 *   - DI: Services are instantiated in ContactApp and passed to components.
 *   - State management: Component-local state only. A production app might
 *     use NgRx or signals for a shared contacts store.
 */

// =============================================================================
// CONSTANTS
// =============================================================================
const PAGE_SIZE = 10; // Contacts per page in the list

// Avatar colour palette — used for initials fallback avatars
const AVATAR_COLORS = [
  '#6B59CC', '#26609E', '#E85D75', '#F4A261', '#2A9D8F',
  '#E76F51', '#8338EC', '#3A86FF', '#06D6A0', '#FFB703'
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate initials from first + last name.
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
}

/**
 * Pick a deterministic colour for a contact based on their id.
 * @param {string} id
 * @returns {string} hex colour
 */
function getAvatarColor(id) {
  const index = parseInt(id, 10) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index] || AVATAR_COLORS[0];
}

/**
 * Escape HTML to prevent XSS when rendering user data.
 * SIMPLIFIED: A production app would use Angular's built-in sanitisation
 * (DomSanitizer, template binding {{ }}) which escapes by default.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Build an avatar <img> or initials <div> element.
 * @param {Contact} contact
 * @param {string} [size='large'] - 'small' | 'large'
 * @returns {string} HTML string
 */
function buildAvatarHtml(contact, size = 'large') {
  const initials = getInitials(contact.firstName, contact.lastName);
  const color    = getAvatarColor(contact.id);
  const dim      = size === 'small' ? 36 : 80;

  if (contact.avatar) {
    return `<img src="${escHtml(contact.avatar)}"
                 alt="${escHtml(contact.firstName)} ${escHtml(contact.lastName)}"
                 class="rounded-2 object-fit-cover"
                 width="${dim}" height="${dim}"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
            <div class="avatar-initials rounded-2 d-none"
                 style="width:${dim}px;height:${dim}px;background:${color};"
                 aria-hidden="true">${escHtml(initials)}</div>`;
  }

  return `<div class="avatar-initials rounded-2"
               style="width:${dim}px;height:${dim}px;background:${color};"
               aria-label="${escHtml(initials)}">${escHtml(initials)}</div>`;
}

/**
 * Format a status string to a Bootstrap colour class.
 * @param {string} status
 * @returns {string}
 */
function statusClass(status) {
  return status === 'online' ? 'bg-success' : 'bg-warning';
}

// =============================================================================
// ContactListComponent
// Renders the left-hand contact list panel.
// Angular equivalent: a standalone component with @Input contacts$ Observable.
// =============================================================================
class ContactListComponent {
  /**
   * @param {HTMLElement} container - The DOM element to render into
   * @param {Function}    onSelect  - Callback fired when a contact is clicked
   */
  constructor(container, onSelect) {
    this.container       = container;
    this.onSelect        = onSelect;
    this.allContacts     = [];
    this.filteredContacts= [];
    this.currentPage     = 0;
    this.selectedId      = null;
  }

  /**
   * Set the full contact list and render the first page.
   * Called by ContactApp after data loads.
   * @param {Contact[]} contacts
   */
  setContacts(contacts) {
    this.allContacts      = contacts;
    this.filteredContacts = contacts;
    this.currentPage      = 0;
    this.render();
  }

  /**
   * Filter contacts by a search query (name, email substring, phone).
   * Called on every keyup in the search input.
   * @param {string} query
   */
  filter(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredContacts = this.allContacts;
    } else {
      this.filteredContacts = this.allContacts.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const phones   = (c.phone || []).join(' ').toLowerCase();
        return fullName.includes(q) || phones.includes(q);
      });
    }
    this.currentPage = 0;
    this.render();
    // Update count display
    this._updateCount();
  }

  /** Navigate to the previous page. */
  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.render();
    }
  }

  /** Navigate to the next page. */
  nextPage() {
    const totalPages = Math.ceil(this.filteredContacts.length / PAGE_SIZE);
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
      this.render();
    }
  }

  /**
   * Mark a contact as selected (adds .active class).
   * @param {string} contactId
   */
  selectContact(contactId) {
    this.selectedId = contactId;
    // Update DOM directly — in Angular this would be a class binding [class.active]
    this.container.querySelectorAll('.contact-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === contactId);
    });
  }

  /**
   * Render the current page of the filtered contacts list into the container.
   * Angular equivalent: *ngFor in the template with async pipe.
   */
  render() {
    const start    = this.currentPage * PAGE_SIZE;
    const pageItems= this.filteredContacts.slice(start, start + PAGE_SIZE);

    if (this.filteredContacts.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state text-center py-5 text-light">
          <i class="fa fa-search fa-2x mb-3"></i>
          <p>No contacts found</p>
        </div>`;
      return;
    }

    this.container.innerHTML = pageItems.map(contact => `
      <div class="contact-item d-flex justify-content-between align-items-center py-3 px-1 rounded-2 ${contact.id === this.selectedId ? 'active' : ''}"
           data-id="${escHtml(contact.id)}"
           role="button"
           tabindex="0"
           aria-label="View ${escHtml(contact.firstName)} ${escHtml(contact.lastName)}'s details">
        <div class="d-flex gap-3 align-items-center">
          <div class="thumb position-relative rounded-2 flex-shrink-0">
            ${buildAvatarHtml(contact, 'small')}
            <span class="status position-absolute ${statusClass(contact.status)} rounded-circle d-block border-2 border-white" aria-label="${escHtml(contact.status)}"></span>
          </div>
          <div class="d-flex flex-column gap-1">
            <b>${escHtml(contact.firstName)} ${escHtml(contact.lastName)}</b>
            <p class="text-light mb-0 fs-12">${escHtml(contact.jobTitle)}</p>
          </div>
        </div>
        <div class="d-flex gap-2 align-items-center three-btns">
          <button class="btn bg-white border border-light text-light action-btn" data-action="message" data-id="${escHtml(contact.id)}" title="Message" aria-label="Message ${escHtml(contact.firstName)}">
            <i class="fa fa-comments" aria-hidden="true"></i>
          </button>
          <button class="btn bg-white border border-light text-light action-btn" data-action="call" data-id="${escHtml(contact.id)}" title="Call" aria-label="Call ${escHtml(contact.firstName)}">
            <i class="fa fa-phone-alt" aria-hidden="true"></i>
          </button>
          <button class="btn bg-white border border-light text-light action-btn" data-action="more" data-id="${escHtml(contact.id)}" title="More options" aria-label="More options for ${escHtml(contact.firstName)}">
            <i class="fa fa-ellipsis" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Attach click events
    this.container.querySelectorAll('.contact-item').forEach(el => {
      // Click anywhere on the row selects the contact
      el.addEventListener('click', (e) => {
        // Don't select if clicking an action button
        if (!e.target.closest('.action-btn')) {
          this.onSelect(el.dataset.id);
        }
      });
      // Keyboard accessibility
      el.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.action-btn')) {
          e.preventDefault();
          this.onSelect(el.dataset.id);
        }
      });
    });

    this._updateCount();
    this._updatePaginationButtons();
  }

  /** Update the contact count label. */
  _updateCount() {
    const countEl = document.getElementById('contact-count');
    if (countEl) {
      const total = this.filteredContacts.length;
      countEl.textContent = `${total} contact${total !== 1 ? 's' : ''}`;
    }
  }

  /** Enable/disable prev-next pagination buttons based on current page. */
  _updatePaginationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    if (!prevBtn || !nextBtn) return;

    const totalPages = Math.ceil(this.filteredContacts.length / PAGE_SIZE);
    prevBtn.disabled = this.currentPage === 0;
    nextBtn.disabled = this.currentPage >= totalPages - 1;
    prevBtn.classList.toggle('opacity-40', prevBtn.disabled);
    nextBtn.classList.toggle('opacity-40', nextBtn.disabled);
  }
}

// =============================================================================
// ContactDetailsComponent
// Renders the right-hand contact detail panel.
// Angular equivalent: a standalone component that receives a @Input() contact
// and fetches email addresses via the service.
// =============================================================================
class ContactDetailsComponent {
  /**
   * @param {HTMLElement}       container  - The DOM element to render into
   * @param {ContactApiService} apiService - Injected service for email fetching
   */
  constructor(container, apiService) {
    this.container  = container;
    this.apiService = apiService;
  }

  /**
   * Display the empty/welcome state before any contact is selected.
   */
  showEmptyState() {
    this.container.innerHTML = `
      <div class="empty-state-details d-flex flex-column align-items-center justify-content-center h-100 text-light">
        <div class="empty-icon mb-4">
          <i class="fa fa-address-card fa-4x" style="color:#ECEEF5;"></i>
        </div>
        <h5 class="fw-bold mb-2" style="color:#8083A3;">Select a contact</h5>
        <p class="text-center px-4" style="max-width:280px;">Choose a contact from the list on the left to view their details here.</p>
      </div>`;
  }

  /**
   * Show a loading spinner while fetching email addresses.
   * @param {Contact} contact - Contact (without emails yet)
   */
  showLoading(contact) {
    this.container.innerHTML = `
      <div class="d-flex flex-column align-items-center justify-content-center h-100 text-light">
        <div class="loading-spinner mb-3"></div>
        <p>Loading ${escHtml(contact.firstName)}'s details…</p>
      </div>`;
  }

  /**
   * Render the full contact detail view.
   * Fetches email addresses from the API service before rendering.
   * Angular equivalent: combined ngOnInit with forkJoin(contact$, emails$).
   *
   * @param {Contact} contact
   */
  async render(contact) {
    // Show a brief loading state while we fetch emails
    this.showLoading(contact);

    let emails = [];
    try {
      emails = await this.apiService.getEmailAddresses(contact.id);
    } catch (err) {
      // SIMPLIFIED: A full implementation would show an error message/retry UI
      console.error('[ContactDetailsComponent] Failed to load emails:', err);
    }

    const primaryEmail = emails.find(e => e.isPrimary);
    const otherEmails  = emails.filter(e => !e.isPrimary);
    const primaryPhone = contact.phone && contact.phone[0];
    const otherPhones  = contact.phone ? contact.phone.slice(1) : [];

    const socialIconMap = {
      facebook:  'fab fa-facebook-f',
      twitter:   'fab fa-twitter',
      linkedin:  'fab fa-linkedin-in',
      pinterest: 'fab fa-pinterest',
      instagram: 'fab fa-instagram',
      google:    'fab fa-google',
      github:    'fab fa-github',
    };

    this.container.innerHTML = `
      <!-- Contact Header -->
      <div class="contact-detail-header d-flex gap-3 align-items-start">
        <div class="thumb-lg flex-shrink-0">
          ${buildAvatarHtml(contact, 'large')}
        </div>
        <div class="flex-grow-1 ms-2">
          <strong class="fs-4 fw-bold d-block mb-1">${escHtml(contact.firstName)} ${escHtml(contact.lastName)}</strong>
          <span class="text-light d-block mb-3">${escHtml(contact.jobTitle)}</span>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn px-3 rounded-3 btn-primary fs-14 fw-semibold" aria-label="Send message">
              <i class="fa fa-comments me-1" aria-hidden="true"></i> Message
            </button>
            <button class="btn bg-white rounded-3 border border-light text-light menu-btn" title="Call" aria-label="Call contact">
              <i class="fa fa-phone-alt" aria-hidden="true"></i>
            </button>
            <button class="btn bg-white rounded-3 border border-light text-light menu-btn" title="Schedule meeting" aria-label="Schedule meeting">
              <i class="fa fa-calendar-alt" aria-hidden="true"></i>
            </button>
            <button class="btn bg-white rounded-3 border border-light text-light menu-btn" title="More options" aria-label="More options">
              <i class="fa fa-ellipsis" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Bio -->
      ${contact.bio ? `
      <div class="detail-row d-flex gap-4 mt-4">
        <span class="detail-label text-light text-end">Bio</span>
        <p class="lh-150 mb-0">${escHtml(contact.bio)}</p>
      </div>` : ''}

      <!-- Email Addresses -->
      ${emails.length > 0 ? `
      <div class="detail-row d-flex gap-4 mt-4">
        <span class="detail-label text-light text-end">Email</span>
        <div class="d-flex justify-content-between align-items-start w-100 gap-2">
          <div class="d-flex gap-2 flex-column">
            ${primaryEmail ? `<p class="mb-0 lh-150 fw-semibold">${escHtml(primaryEmail.email)}</p>` : ''}
            ${otherEmails.map(e => `<p class="mb-0 lh-150 text-light">${escHtml(e.email)}</p>`).join('')}
          </div>
          ${primaryEmail ? `<span class="badge-primary-label bg-light rounded-2 py-1 px-3 fw-semibold text-light flex-shrink-0">Primary</span>` : ''}
        </div>
      </div>` : ''}

      <!-- Dial -->
      ${contact.dial ? `
      <div class="detail-row d-flex gap-4 mt-4">
        <span class="detail-label text-light text-end">Dial</span>
        <p class="mb-0 lh-150">${escHtml(contact.dial)}</p>
      </div>` : ''}

      <!-- Meeting Link -->
      ${contact.meeting ? `
      <div class="detail-row d-flex gap-4 mt-4">
        <span class="detail-label text-light text-end">Meeting</span>
        <a href="${escHtml(contact.meeting)}" target="_blank" rel="noopener noreferrer" class="text-primary lh-150 word-break-all">${escHtml(contact.meeting)}</a>
      </div>` : ''}

      <!-- Phone Numbers -->
      ${contact.phone && contact.phone.length > 0 ? `
      <div class="detail-row d-flex gap-4 mt-4">
        <span class="detail-label text-light text-end">Phone</span>
        <div class="d-flex justify-content-between align-items-start w-100 gap-2">
          <div class="d-flex gap-2 flex-column">
            ${contact.phone.map((ph, idx) => `<p class="mb-0 lh-150 ${idx > 0 ? 'text-light' : 'fw-semibold'}">${escHtml(ph)}</p>`).join('')}
          </div>
          ${primaryPhone ? `<span class="badge-primary-label bg-light rounded-2 py-1 px-3 fw-semibold text-light flex-shrink-0">Primary</span>` : ''}
        </div>
      </div>` : ''}

      <!-- Address -->
      ${contact.address ? `
      <div class="detail-row d-flex gap-4 mt-4">
        <span class="detail-label text-light text-end">Address</span>
        <p class="mb-0 lh-150">${escHtml(contact.address)}</p>
      </div>` : ''}

      <!-- Social Links -->
      ${Object.keys(contact.social || {}).length > 0 ? `
      <div class="detail-row d-flex gap-4 mt-4 align-items-center">
        <span class="detail-label text-light text-end">Social</span>
        <div class="d-flex gap-2 flex-wrap">
          ${Object.entries(contact.social).map(([network, url]) => {
            const iconClass = socialIconMap[network] || 'fas fa-globe';
            return `<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer"
                       class="btn bg-white rounded-3 border border-light text-light menu-btn"
                       title="${escHtml(network)}"
                       aria-label="${escHtml(network)} profile">
                      <i class="${escHtml(iconClass)}" aria-hidden="true"></i>
                    </a>`;
          }).join('')}
        </div>
      </div>` : ''}
    `;
  }
}

// =============================================================================
// ContactApp — Root Application / AppModule bootstrapper
// Angular equivalent: AppModule with bootstrap: [AppComponent]
// =============================================================================
class ContactApp {
  constructor() {
    // Dependency Injection — services instantiated here (Angular would use the DI container)
    this.apiService = new window.ContactApiService();

    // Get DOM references
    this.listContainer    = document.getElementById('contact-list');
    this.detailContainer  = document.getElementById('contact-details');
    this.searchInput      = document.getElementById('search-input');
    this.prevBtn          = document.getElementById('prev-btn');
    this.nextBtn          = document.getElementById('next-btn');
    this.loadingOverlay   = document.getElementById('loading-overlay');
    this.mockBadge        = document.getElementById('mock-badge');

    // Initialise components — passing this.apiService is the DI pattern
    this.contactListComponent    = new ContactListComponent(
      this.listContainer,
      (id) => this._onContactSelected(id)
    );
    this.contactDetailsComponent = new ContactDetailsComponent(
      this.detailContainer,
      this.apiService
    );
  }

  /**
   * Bootstrap the application. Fetches initial data and wires up events.
   * Angular equivalent: AppComponent ngOnInit()
   */
  async init() {
    this._showLoading(true);
    this.contactDetailsComponent.showEmptyState();

    try {
      const contacts = await this.apiService.getContacts();
      this.contactListComponent.setContacts(contacts);

      // Show a notice if mock data is being used
      if (this.apiService.usingMockData && this.mockBadge) {
        this.mockBadge.classList.remove('d-none');
      }

      // Auto-select the first contact for a better first impression
      if (contacts.length > 0) {
        this._onContactSelected(contacts[0].id);
      }
    } catch (err) {
      // SIMPLIFIED: A production app would show a proper error state component
      // with retry logic and possibly Sentry/logging integration.
      console.error('[ContactApp] Fatal error during init:', err);
      this.listContainer.innerHTML = `
        <div class="empty-state text-center py-5 text-danger">
          <i class="fa fa-exclamation-circle fa-2x mb-3"></i>
          <p>Failed to load contacts. Please refresh the page.</p>
        </div>`;
    } finally {
      this._showLoading(false);
    }

    // Wire up search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.contactListComponent.filter(e.target.value);
      });
      // Clear on Escape
      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.searchInput.value = '';
          this.contactListComponent.filter('');
        }
      });
    }

    // Wire up pagination
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.contactListComponent.prevPage());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.contactListComponent.nextPage());

    // Mobile: close detail panel on back
    const backBtn = document.getElementById('detail-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        document.getElementById('app-wrapper')?.classList.remove('detail-open');
      });
    }
  }

  /**
   * Handle contact selection — called by ContactListComponent.
   * In Angular this would use @Output() EventEmitter or a shared store.
   * @param {string} contactId
   */
  _onContactSelected(contactId) {
    const contact = this.contactListComponent.allContacts.find(c => c.id === contactId);
    if (!contact) return;

    // Mark selected in list
    this.contactListComponent.selectContact(contactId);

    // Render details
    this.contactDetailsComponent.render(contact);

    // On mobile, slide the detail panel into view
    document.getElementById('app-wrapper')?.classList.add('detail-open');
  }

  /**
   * Toggle the full-screen loading overlay.
   * @param {boolean} show
   */
  _showLoading(show) {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.toggle('d-none', !show);
    }
  }
}

// =============================================================================
// Bootstrap — equivalent to Angular's platformBrowserDynamic().bootstrapModule()
// =============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  const app = new ContactApp();
  await app.init();

  // Run tests after init (output in console)
  if (typeof runTests === 'function') runTests(ContactListComponent, getInitials, escHtml);
});
