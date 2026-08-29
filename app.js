const KEY = 'sj_connect_data_v2';

const seed = {
  customers: [
    {
      id: 'C001',
      partyName: 'Demo Jewellery',
      contactPerson: 'Demo Customer',
      phone: '919876543210',
      alternate: '',
      city: 'Coimbatore',
      address: '',
      state: 'Tamil Nadu',
      exhibition: '',
      notes: 'Sample record',
      created: '2026-08-27'
    }
  ],
  orders: [],
  exhibitions: [],
  reviews: [],
  messages: []
};

let data = JSON.parse(localStorage.getItem(KEY) || 'null') || seed;
let view = 'dashboard';
let selectedCustomer = null;

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function esc(v = '') {
  return String(v).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[c]));
}

function dateNow() {
  return new Date().toISOString().slice(0, 10);
}

function money(v) {
  return '₹' + Number(v || 0).toLocaleString('en-IN');
}

function wa(phone, msg) {
  let p = String(phone || '').replace(/\D/g, '');

  if (p.length === 10) {
    p = '91' + p;
  }

  if (!p) {
    toast('WhatsApp number not available');
    return;
  }

  window.open(
    'https://wa.me/' + p + '?text=' + encodeURIComponent(msg),
    '_blank'
  );
}

function customer(id) {
  return data.customers.find(c => c.id === id);
}

/* --------------------------------------------------
   CUSTOMER HELPERS
-------------------------------------------------- */

function customerName(c) {
  if (!c) return 'Customer';

  return c.partyName ||
         c.name ||
         c.shop ||
         c.contactPerson ||
         'Customer';
}

function contactName(c) {
  if (!c) return '';

  return c.contactPerson || '';
}

/* --------------------------------------------------
   MESSAGE TEMPLATES
-------------------------------------------------- */

const templates = [
  ['🎪', 'Exhibition Invitation', 'Invite a customer to your exhibition'],
  ['🎉', 'Festival Greeting', 'Festival greeting with image option'],
  ['🙏', 'Stall Visit Thank You', 'Thank them for visiting your stall'],
  ['💎', 'Order Thank You', 'Thank them for placing an order'],
  ['🏭', 'Order Started', 'Production has started'],
  ['✅', 'Order Completed', 'Order is completed'],
  ['📦', 'Ready for Delivery', 'Order is ready'],
  ['🚚', 'Delivery Update', 'Delivery status update'],
  ['⭐', 'Review Request', 'Ask for customer feedback'],
  ['🔁', 'Repeat Order', 'Reconnect for a new order'],
  ['✨', 'New Collection', 'Announce a new collection'],
  ['📅', 'Follow-up', 'Friendly follow-up message']
];

function msgFor(type, c, o = {}) {

  const name = customerName(c);
  const person = contactName(c);
  const greeting = person ? `${person}` : name;
  const order = o.orderNo || o.id || 'your order';

  const map = {

    'Exhibition Invitation':
`Dear ${greeting},

We are pleased to invite you to visit SHREE JI GOLD CREATOR LLP at our upcoming exhibition. We would be delighted to meet you and showcase our latest collections.

We look forward to welcoming you.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Festival Greeting':
`Dear ${greeting},

Warm festival wishes from SHREE JI GOLD CREATOR LLP! ✨

May this festive season bring happiness, prosperity and success to you and your family.

With best wishes,
SHREE JI GOLD CREATOR LLP`,

    'Stall Visit Thank You':
`Dear ${greeting},

Thank you for visiting the SHREE JI GOLD CREATOR LLP stall. 🙏

It was a pleasure meeting you. We truly appreciate your valuable time and interest in our products.

We look forward to serving you again.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Order Thank You':
`Dear ${greeting},

Thank you for placing your order with SHREE JI GOLD CREATOR LLP. 💎

Your order ${order} has been registered successfully.

We sincerely appreciate your trust and support.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Order Started':
`Dear ${greeting},

A quick update from SHREE JI GOLD CREATOR LLP.

Your order ${order} has now been started in production. 🏭

We will keep you updated on the progress.

Thank you for your trust.`,

    'Order Completed':
`Dear ${greeting},

Good news!

Your order ${order} has been completed successfully. ✅

We will update you regarding the next step shortly.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Ready for Delivery':
`Dear ${greeting},

Your order ${order} is ready for delivery. 📦

Please contact us if you need any assistance regarding delivery arrangements.

Thank you,
SHREE JI GOLD CREATOR LLP`,

    'Delivery Update':
`Dear ${greeting},

This is an update regarding your order ${order}. 🚚

Your delivery is being arranged.

We will coordinate the delivery details with you.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Review Request':
`Dear ${greeting},

Thank you for choosing SHREE JI GOLD CREATOR LLP. ⭐

We would love to know about your experience with us.

Your feedback helps us improve and serve you better.

Thank you for your valuable support.`,

    'Repeat Order':
`Dear ${greeting},

We hope you are doing well.

It has been a pleasure serving you. 💎

If you have any upcoming requirements or repeat orders, please feel free to contact us.

We would be happy to assist you.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'New Collection':
`Dear ${greeting},

We are excited to share our latest collection from SHREE JI GOLD CREATOR LLP. ✨

If you would like to see the new designs, please let us know.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Follow-up':
`Dear ${greeting},

Greetings from SHREE JI GOLD CREATOR LLP.

Just following up regarding your recent enquiry/order.

Please let us know if you need any assistance.

Regards,
SHREE JI GOLD CREATOR LLP`
  };

  return map[type] || '';
}

/* --------------------------------------------------
   LAYOUT
-------------------------------------------------- */

function layout() {

  const m = $('#main');

  if (!m) return;

  const render = {
    dashboard,
    customers,
    orders,
    whatsapp,
    exhibitions,
    reviews,
    reports,
    settings
  }[view];

  if (render) {
    m.innerHTML = render();
  }

  $$('.nav-item').forEach(b => {
    b.classList.toggle(
      'active',
      b.dataset.view === view
    );
  });
}

/* --------------------------------------------------
   DASHBOARD
-------------------------------------------------- */

function dashboard() {

  const active = data.orders.filter(
    o => !['Delivered', 'Cancelled'].includes(o.status)
  ).length;

  const done = data.orders.filter(
    o => o.status === 'Delivered'
  ).length;

  const pending = data.orders.filter(
    o => o.status !== 'Delivered' &&
         o.status !== 'Cancelled'
  ).length;

  const value = data.orders.reduce(
    (s, o) => s + Number(o.value || 0),
    0
  );

  return `
  <div class="hero">

    <div class="eyebrow">Owner Dashboard</div>

    <h2>SHREE JI GOLD CREATOR LLP</h2>

    <div class="muted">
      Customer relationships, orders and WhatsApp communication — all in one place.
    </div>

    <div class="quick">

      <button class="btn primary"
        onclick="openCustomer()">
        ➕ Add Customer
      </button>

      <button class="btn"
        onclick="openOrder()">
        📦 New Order
      </button>

      <button class="btn"
        onclick="setView('whatsapp')">
        💬 WhatsApp Center
      </button>

      <button class="btn"
        onclick="openExhibition()">
        🎪 New Exhibition
      </button>

    </div>

  </div>

  <div class="grid stats">

    <div class="card">
      <div class="stat-label">TOTAL CUSTOMERS</div>
      <div class="stat-value">${data.customers.length}</div>
      <div class="stat-note">● CRM database</div>
    </div>

    <div class="card">
      <div class="stat-label">ACTIVE ORDERS</div>
      <div class="stat-value">${active}</div>
      <div class="stat-note">● In progress</div>
    </div>

    <div class="card">
      <div class="stat-label">COMPLETED</div>
      <div class="stat-value">${done}</div>
      <div class="stat-note">● Delivered</div>
    </div>

    <div class="card">
      <div class="stat-label">PENDING DELIVERY</div>
      <div class="stat-value">${pending}</div>
      <div class="stat-note">● Requires attention</div>
    </div>

    <div class="card">
      <div class="stat-label">ORDER VALUE</div>
      <div class="stat-value">${money(value)}</div>
      <div class="stat-note">● All recorded orders</div>
    </div>

  </div>

  <div class="grid two">

    <div class="card">

      <div class="section-title">
        📦 Recent Orders
      </div>

      ${
        data.orders.length
        ?
        `<div class="list">
          ${data.orders.slice(-5).reverse().map(o => {

            const c = customer(o.customerId);

            return `
            <div class="list-row">

              <div class="row-main">

                <div class="row-title">
                  ${esc(o.orderNo)}
                  •
                  ${esc(customerName(c))}
                </div>

                <div class="row-sub">
                  ${esc(o.item || 'Order')}
                  •
                  ${esc(o.startDate || '-')}
                </div>

              </div>

              <span class="pill ${
                o.status === 'Delivered'
                ? 'green'
                : o.status === 'Completed'
                ? 'blue'
                : 'gold'
              }">
                ${esc(o.status)}
              </span>

            </div>
            `;

          }).join('')}
        </div>`
        :
        `<div class="empty">
          No orders yet. Create your first order.
        </div>`
      }

    </div>

    <div class="card">

      <div class="section-title">
        ⭐ Recent Reviews
      </div>

      ${
        data.reviews.length
        ?
        `<div class="list">
          ${data.reviews.slice(-5).reverse().map(r => {

            const c = customer(r.customerId);

            return `
            <div class="list-row">

              <div>
                <b>${esc(customerName(c))}</b>

                <div class="row-sub">
                  ${esc(r.text || 'No comment')}
                </div>
              </div>

              <span>
                ${'⭐'.repeat(Number(r.rating || 0))}
              </span>

            </div>
            `;

          }).join('')}
        </div>`
        :
        `<div class="empty">
          Reviews will appear here after delivery.
        </div>`
      }

    </div>

  </div>
  `;
}

/* --------------------------------------------------
   CUSTOMERS
-------------------------------------------------- */

function customers() {

  return `

  <div class="page-head">

    <div>

      <div class="eyebrow">CRM</div>

      <div class="title">
        Customers
      </div>

      <div class="muted">
        Every party, contact and relationship in one place.
      </div>

    </div>

    <button class="btn primary"
      onclick="openCustomer()">
      ➕ Add Customer
    </button>

  </div>

  <div class="searchbar">

    <input
      class="input"
      id="customerSearch"
      placeholder="Search party, contact, WhatsApp, shop or city..."
      oninput="filterCustomers()">

  </div>

  <div class="card table-wrap">

    <table class="table">

      <thead>

        <tr>

          <th>Party / Contact</th>
          <th>WhatsApp</th>
          <th>Shop / Company</th>
          <th>City</th>
          <th>Orders</th>
          <th>Actions</th>

        </tr>

      </thead>

      <tbody id="customerRows">

        ${customerRows(data.customers)}

      </tbody>

    </table>

  </div>

  `;
}

function customerRows(list) {

  return list.map(c => {

    const ordersCount = data.orders.filter(
      o => o.customerId === c.id
    ).length;

    return `

    <tr>

      <td>

        <b>
          ${esc(customerName(c))}
        </b>

        ${
          c.contactPerson
          ?
          `<div class="row-sub">
            Contact: ${esc(c.contactPerson)}
          </div>`
          :
          ''
        }

      </td>

      <td>
        ${esc(c.phone || '-')}
      </td>

      <td>
        ${esc(c.shop || c.partyName || '-')}
      </td>

      <td>
        ${esc(c.city || '-')}
      </td>

      <td>
        ${ordersCount}
      </td>

      <td>

        <div class="actions">

          <button
            class="btn"
            onclick="viewCustomer('${c.id}')">
            View
          </button>

          <button
            class="btn whatsapp"
            onclick="quickWhatsApp('${c.id}')">
            WhatsApp
          </button>

          <button
            class="btn danger"
            onclick="deleteCustomer('${c.id}')">
            Delete
          </button>

        </div>

      </td>

    </tr>

    `;

  }).join('') ||

  `
  <tr>
    <td colspan="6" class="empty">
      No customers found.
    </td>
  </tr>
  `;
}

function filterCustomers() {

  const input = $('#customerSearch');

  if (!input) return;

  const q = input.value.toLowerCase();

  const list = data.customers.filter(c => {

    return [

      c.partyName,
      c.contactPerson,
      c.name,
      c.phone,
      c.alternate,
      c.city,
      c.address,
      c.state,
      c.exhibition,
      c.shop,
      c.notes

    ]
    .join(' ')
    .toLowerCase()
    .includes(q);

  });

  $('#customerRows').innerHTML =
    customerRows(list);
}

/* --------------------------------------------------
   ADD / EDIT CUSTOMER
-------------------------------------------------- */

function openCustomer(existing) {

  const c = existing || {};

  openModal(
    existing ? 'Edit Customer' : 'Add Customer',

    `

    <div class="form-grid">

      <div class="field full">

        <label>
          Party Name *
        </label>

        <input
          class="input"
          id="fPartyName"
          placeholder="Company / Shop / Party Name"
          value="${esc(c.partyName || c.shop || c.name || '')}">

      </div>

      <div class="field">

        <label>
          Contact Person
        </label>

        <input
          class="input"
          id="fContactPerson"
          placeholder="Contact Person Name"
          value="${esc(c.contactPerson || '')}">

      </div>

      <div class="field">

        <label>
          WhatsApp Number *
        </label>

        <input
          class="input"
          id="fPhone"
          inputmode="tel"
          placeholder="10 digit WhatsApp number"
          value="${esc(c.phone || '')}">

      </div>

      <div class="field">

        <label>
          Alternate Number
        </label>

        <input
          class="input"
          id="fAlternate"
          inputmode="tel"
          placeholder="Alternate mobile number"
          value="${esc(c.alternate || '')}">

      </div>

      <div class="field">

        <label>
          City
        </label>

        <input
          class="input"
          id="fCity"
          placeholder="City"
          value="${esc(c.city || '')}">

      </div>

      <div class="field full">

        <label>
          Address
        </label>

        <textarea
          class="textarea"
          id="fAddress"
          placeholder="Full address">${esc(c.address || '')}</textarea>

      </div>

      <div class="field">

        <label>
          State
        </label>

        <input
          class="input"
          id="fState"
          value="${esc(c.state || 'Tamil Nadu')}">

      </div>

      <div class="field">

        <label>
          Exhibition
        </label>

        <input
          class="input"
          id="fExhibition"
          placeholder="Exhibition name"
          value="${esc(c.exhibition || '')}">

      </div>

      <div class="field full">

        <label>
          Notes
        </label>

        <textarea
          class="textarea"
          id="fNotes"
          placeholder="Customer notes">${esc(c.notes || '')}</textarea>

      </div>

    </div>

    <div class="modal-actions">

      <button
        class="btn"
        onclick="closeModal()">
        Cancel
      </button>

      <button
        class="btn primary"
        onclick="saveCustomer('${c.id || ''}')">
        Save Customer
      </button>

    </div>

    `
  );
}

function saveCustomer(id) {

  const partyName =
    $('#fPartyName').value.trim();

  const contactPerson =
    $('#fContactPerson').value.trim();

  const phone =
    $('#fPhone').value.trim();

  if (!partyName || !phone) {

    return toast(
      'Party Name and WhatsApp number are required'
    );

  }

  const old = id
    ? data.customers.find(c => c.id === id)
    : null;

  const obj = {

    id: id || 'C' + Date.now().toString().slice(-7),

    partyName,

    contactPerson,

    phone,

    alternate:
      $('#fAlternate').value.trim(),

    city:
      $('#fCity').value.trim(),

    address:
      $('#fAddress').value.trim(),

    state:
      $('#fState').value.trim(),

    exhibition:
      $('#fExhibition').value.trim(),

    notes:
      $('#fNotes').value.trim(),

    /* Old-data compatibility */
    name: partyName,

    shop: partyName,

    created:
      old?.created || dateNow()

  };

  if (id) {

    const i =
      data.customers.findIndex(
        c => c.id === id
      );

    if (i >= 0) {
      data.customers[i] = obj;
    }

  } else {

    data.customers.push(obj);

  }

  save();

  closeModal();

  layout();

  toast(
    id
    ? 'Customer updated successfully'
    : 'Customer added successfully'
  );
}

function deleteCustomer(id) {

  if (!confirm('Delete this customer?')) {
    return;
  }

  data.customers =
    data.customers.filter(
      c => c.id !== id
    );

  data.orders =
    data.orders.filter(
      o => o.customerId !== id
    );

  save();

  layout();

  toast('Customer deleted');
}

/* --------------------------------------------------
   CUSTOMER VIEW
-------------------------------------------------- */

function viewCustomer(id) {

  const c = customer(id);

  if (!c) return;

  const os =
    data.orders.filter(
      o => o.customerId === id
    );

  openModal(

    customerName(c),

    `

    <div class="grid two">

      <div class="card">

        <div class="section-title">
          Customer Details
        </div>

        <p>
          <b>Party Name:</b>
          ${esc(c.partyName || c.shop || c.name || '-')}
        </p>

        <p>
          <b>Contact Person:</b>
          ${esc(c.contactPerson || '-')}
        </p>

        <p>
          <b>WhatsApp:</b>
          ${esc(c.phone || '-')}
        </p>

        <p>
          <b>Alternate:</b>
          ${esc(c.alternate || '-')}
        </p>

        <p>
          <b>City:</b>
          ${esc(c.city || '-')}
        </p>

        <p>
          <b>Address:</b>
          ${esc(c.address || '-')}
        </p>

        <p>
          <b>State:</b>
          ${esc(c.state || '-')}
        </p>

        <p>
          <b>Exhibition:</b>
          ${esc(c.exhibition || '-')}
        </p>

        <p>
          <b>Notes:</b>
          ${esc(c.notes || '-')}
        </p>

        <div class="actions">

          <button
            class="btn whatsapp"
            onclick="quickWhatsApp('${id}')">
            💬 WhatsApp
          </button>

          <button
            class="btn"
            onclick="editCustomerFromView('${id}')">
            Edit
          </button>

        </div>

      </div>

      <div class="card">

        <div class="section-title">
          📜 Customer Timeline
        </div>

        <div class="timeline">

          ${
            os.map(o => `

              <div class="event">

                <b>
                  ${esc(o.status)}
                </b>

                <div class="row-sub">
                  Order ${esc(o.orderNo)}
                  •
                  ${esc(o.item || '')}
                </div>

                <small>
                  ${esc(o.startDate || o.orderDate || '-')}
                </small>

              </div>

            `).join('')
            ||
            '<div class="muted">No orders yet.</div>'
          }

        </div>

      </div>

    </div>

    `
  );
}

function editCustomerFromView(id) {

  const c = customer(id);

  closeModal();

  setTimeout(() => {
    openCustomer(c);
  }, 100);

}

/* --------------------------------------------------
   WHATSAPP
-------------------------------------------------- */

function quickWhatsApp(id) {

  const c = customer(id);

  if (!c) return;

  wa(
    c.phone,
    msgFor('Follow-up', c)
  );

  data.messages.push({
    customerId: id,
    type: 'Follow-up',
    date: dateNow()
  });

  save();

  toast('WhatsApp opened');
}

function whatsapp() {

  return `

  <div class="page-head">

    <div>

      <div class="eyebrow">
        Communication
      </div>

      <div class="title">
        WhatsApp Center
      </div>

      <div class="muted">
        Choose a ready-made business message, then open WhatsApp with one tap.
      </div>

    </div>

  </div>

  <div class="notice">

    ⚡ Messages are prepared for you.
    WhatsApp opens for final review and sending.

  </div>

  <div
    class="grid template-grid"
    style="margin-top:16px">

    ${
      templates.map(t => `

        <div
          class="card template"
          onclick="openWhatsAppTemplate('${esc(t[1])}')">

          <div class="template-icon">
            ${t[0]}
          </div>

          <h4>
            ${esc(t[1])}
          </h4>

          <p>
            ${esc(t[2])}
          </p>

        </div>

      `).join('')
    }

  </div>

  `;
}

function openWhatsAppTemplate(type) {

  const opts =
    data.customers.map(c => `

      <option value="${c.id}">
        ${esc(customerName(c))}
        ${c.contactPerson ? ' — ' + esc(c.contactPerson) : ''}
        — ${esc(c.phone)}
      </option>

    `).join('');

  openModal(

    type,

    `

    <div class="field">

      <label>
        Customer
      </label>

      <select
        class="select"
        id="waCustomer">

        ${
          opts ||
          '<option>No customers</option>'
        }

      </select>

    </div>

    <div
      class="field"
      style="margin-top:12px">

      <label>
        Message Preview
      </label>

      <textarea
        class="textarea"
        id="waPreview"
        rows="12"></textarea>

    </div>

    <div class="modal-actions">

      <button
        class="btn"
        onclick="closeModal()">
        Cancel
      </button>

      <button
        class="btn primary"
        onclick="sendTemplate('${esc(type)}')">
        💬 Open WhatsApp
      </button>

    </div>

    `
  );

  const s = $('#waCustomer');

  if (!s) return;

  const update = () => {

    const c = customer(s.value);

    if ($('#waPreview')) {
      $('#waPreview').value =
        msgFor(type, c);
    }

  };

  s.onchange = update;

  update();
}

function sendTemplate(type) {

  const c =
    customer($('#waCustomer').value);

  if (!c) return;

  wa(
    c.phone,
    $('#waPreview').value
  );

  data.messages.push({
    customerId: c.id,
    type,
    date: dateNow()
  });

  save();

  closeModal();
}

/* --------------------------------------------------
   ORDERS
-------------------------------------------------- */

function orders() {

  return `

  <div class="page-head">

    <div>

      <div class="eyebrow">
        Production
      </div>

      <div class="title">
        Orders
      </div>

      <div class="muted">
        Track every order from start to finish and delivery.
      </div>

    </div>

    <button
      class="btn primary"
      onclick="openOrder()">
      ➕ New Order
    </button>

  </div>

  <div class="card table-wrap">

    <table class="table">

      <thead>

        <tr>

          <th>Order</th>
          <th>Customer</th>
          <th>Item</th>
          <th>Start</th>
          <th>Finish</th>
          <th>Delivery</th>
          <th>Status</th>
          <th>Value</th>
          <th></th>

        </tr>

      </thead>

      <tbody>

        ${
          data.orders.slice().reverse().map(o => {

            const c = customer(o.customerId);

            return `

            <tr>

              <td>
                <b>${esc(o.orderNo)}</b>
              </td>

              <td>
                ${esc(customerName(c))}
              </td>

              <td>
                ${esc(o.item || '-')}
              </td>

              <td>
                ${esc(o.startDate || '-')}
              </td>

              <td>
                ${esc(o.finishDate || '-')}
              </td>

              <td>
                ${esc(o.deliveryDate || '-')}
              </td>

              <td>

                <span class="pill ${
                  o.status === 'Delivered'
                  ? 'green'
                  : o.status === 'Completed'
                  ? 'blue'
                  : 'gold'
                }">

                  ${esc(o.status)}

                </span>

              </td>

              <td>
                ${money(o.value)}
              </td>

              <td>

                <div class="actions">

                  <button
                    class="btn"
                    onclick="editOrder('${o.id}')">
                    Edit
                  </button>

                  <button
                    class="btn"
                    onclick="orderWhatsApp('${o.id}')">
                    💬
                  </button>

                </div>

              </td>

            </tr>

            `;

          }).join('')
          ||
          `
          <tr>
            <td colspan="9" class="empty">
              No orders yet.
            </td>
          </tr>
          `
        }

      </tbody>

    </table>

  </div>

  `;
}

function openOrder(existing) {

  const o = existing || {};

  const opts =
    data.customers.map(c => `

      <option
        value="${c.id}"
        ${c.id === o.customerId ? 'selected' : ''}>

        ${esc(customerName(c))}
        — ${esc(c.phone)}

      </option>

    `).join('');

  openModal(

    existing ? 'Edit Order' : 'New Order',

    `

    <div class="form-grid">

      <div class="field">

        <label>
          Customer *
        </label>

        <select
          class="select"
          id="oCustomer">

          ${
            opts ||
            '<option value="">Add customer first</option>'
          }

        </select>

      </div>

      <div class="field">

        <label>
          Order Number
        </label>

        <input
          class="input"
          id="oNo"
          value="${esc(
            o.orderNo ||
            'SJ-' +
            new Date().getFullYear() +
            '-' +
            String(data.orders.length + 1).padStart(4, '0')
          )}">

      </div>

      <div class="field full">

        <label>
          Item / Description
        </label>

        <input
          class="input"
          id="oItem"
          value="${esc(o.item || '')}">

      </div>

      <div class="field">

        <label>
          Order Date
        </label>

        <input
          class="input"
          type="date"
          id="oDate"
          value="${esc(o.orderDate || dateNow())}">

      </div>

      <div class="field">

        <label>
          Start Date
        </label>

        <input
          class="input"
          type="date"
          id="oStart"
          value="${esc(o.startDate || '')}">

      </div>

      <div class="field">

        <label>
          Expected Finish
        </label>

        <input
          class="input"
          type="date"
          id="oExpected"
          value="${esc(o.expectedFinish || '')}">

      </div>

      <div class="field">

        <label>
          Actual Finish
        </label>

        <input
          class="input"
          type="date"
          id="oFinish"
          value="${esc(o.finishDate || '')}">

      </div>

      <div class="field">

        <label>
          Delivery Date
        </label>

        <input
          class="input"
          type="date"
          id="oDelivery"
          value="${esc(o.deliveryDate || '')}">

      </div>

      <div class="field">

        <label>
          Status
        </label>

        <select
          class="select"
          id="oStatus">

          ${
            [
              'New',
              'Started',
              'Production',
              'Completed',
              'Hallmarking',
              'Ready',
              'Delivered',
              'Cancelled'
            ].map(s => `

              <option
                ${s === (o.status || 'New')
                  ? 'selected'
                  : ''}>

                ${s}

              </option>

            `).join('')
          }

        </select>

      </div>

      <div class="field">

        <label>
          Order Value (₹)
        </label>

        <input
          class="input"
          type="number"
          id="oValue"
          value="${esc(o.value || '')}">

      </div>

      <div class="field">

        <label>
          Advance (₹)
        </label>

        <input
          class="input"
          type="number"
          id="oAdvance"
          value="${esc(o.advance || '')}">

      </div>

      <div class="field">

        <label>
          Gold Weight
        </label>

        <input
          class="input"
          id="oWeight"
          value="${esc(o.weight || '')}">

      </div>

      <div class="field">

        <label>
          Gold Touch
        </label>

        <input
          class="input"
          id="oTouch"
          value="${esc(o.touch || '')}">

      </div>

      <div class="field">

        <label>
          Screw Type
        </label>

        <input
          class="input"
          id="oScrew"
          value="${esc(o.screw || '')}">

      </div>

      <div class="field full">

        <label>
          Notes
        </label>

        <textarea
          class="textarea"
          id="oNotes">${esc(o.notes || '')}</textarea>

      </div>

    </div>

    <div class="modal-actions">

      <button
        class="btn"
        onclick="closeModal()">
        Cancel
      </button>

      <button
        class="btn primary"
        onclick="saveOrder('${o.id || ''}')">
        Save Order
      </button>

    </div>

    `
  );
}

function saveOrder(id) {

  const customerId =
    $('#oCustomer').value;

  if (!customerId) {
    return toast('Select a customer');
  }

  const obj = {

    id: id || 'O' + Date.now(),

    customerId,

    orderNo:
      $('#oNo').value.trim(),

    item:
      $('#oItem').value.trim(),

    orderDate:
      $('#oDate').value,

    startDate:
      $('#oStart').value,

    expectedFinish:
      $('#oExpected').value,

    finishDate:
      $('#oFinish').value,

    deliveryDate:
      $('#oDelivery').value,

    status:
      $('#oStatus').value,

    value:
      Number($('#oValue').value || 0),

    advance:
      Number($('#oAdvance').value || 0),

    weight:
      $('#oWeight').value,

    touch:
      $('#oTouch').value,

    screw:
      $('#oScrew').value,

    notes:
      $('#oNotes').value.trim()

  };

  if (id) {

    const i =
      data.orders.findIndex(
        o => o.id === id
      );

    if (i >= 0) {
      data.orders[i] = obj;
    }

  } else {

    data.orders.push(obj);

  }

  save();

  closeModal();

  layout();

  toast(
    id
    ? 'Order updated'
    : 'Order created'
  );
}

function editOrder(id) {

  openOrder(
    data.orders.find(
      o => o.id === id
    )
  );

}

function orderWhatsApp(id) {

  const o =
    data.orders.find(
      x => x.id === id
    );

  if (!o) return;

  const c =
    customer(o.customerId);

  if (!c) return;

  let type =
    'Order Thank You';

  if (
    o.status === 'Started' ||
    o.status === 'Production'
  ) {
    type = 'Order Started';
  }

  else if (o.status === 'Completed') {
    type = 'Order Completed';
  }

  else if (o.status === 'Ready') {
    type = 'Ready for Delivery';
  }

  else if (o.status === 'Delivered') {
    type = 'Delivery Update';
  }

  wa(
    c.phone,
    msgFor(type, c, o)
  );

  data.messages.push({
    customerId: c.id,
    type,
    date: dateNow(),
    orderId: id
  });

  save();

  toast('WhatsApp opened');
}

/* --------------------------------------------------
   EXHIBITIONS
-------------------------------------------------- */

function exhibitions() {

  return `

  <div class="page-head">

    <div>

      <div class="eyebrow">
        Campaigns
      </div>

      <div class="title">
        Exhibitions
      </div>

      <div class="muted">
        Invite customers, track visits and convert follow-ups into orders.
      </div>

    </div>

    <button
      class="btn primary"
      onclick="openExhibition()">
      ➕ New Exhibition
    </button>

  </div>

  <div class="grid three">

    ${
      data.exhibitions.map(e => `

        <div class="card">

          <div class="eyebrow">
            ${esc(e.date || '-')}
          </div>

          <h3>
            ${esc(e.name)}
          </h3>

          <div class="muted">
            📍 ${esc(e.venue || '-')}
          </div>

          <div
            style="margin-top:15px"
            class="actions">

            <button
              class="btn"
              onclick="inviteCampaign('${e.id}')">
              🎪 Invite
            </button>

            <button
              class="btn"
              onclick="markExhibitionVisit('${e.id}')">
              👣 Visit
            </button>

          </div>

        </div>

      `).join('')
      ||
      `
      <div
        class="card empty"
        style="grid-column:1/-1">

        No exhibitions yet.
        Create one to start a campaign.

      </div>
      `
    }

  </div>

  `;
}

function openExhibition(existing) {

  const e = existing || {};

  openModal(

    existing
    ? 'Edit Exhibition'
    : 'New Exhibition',

    `

    <div class="form-grid">

      <div class="field">

        <label>
          Exhibition Name *
        </label>

        <input
          class="input"
          id="eName"
          value="${esc(e.name || '')}">

      </div>

      <div class="field">

        <label>
          Date
        </label>

        <input
          class="input"
          type="date"
          id="eDate"
          value="${esc(e.date || '')}">

      </div>

      <div class="field full">

        <label>
          Venue
        </label>

        <input
          class="input"
          id="eVenue"
          value="${esc(e.venue || '')}">

      </div>

    </div>

    <div class="modal-actions">

      <button
        class="btn"
        onclick="closeModal()">
        Cancel
      </button>

      <button
        class="btn primary"
        onclick="saveExhibition('${e.id || ''}')">
        Save Exhibition
      </button>

    </div>

    `
  );
}

function saveExhibition(id) {

  const name =
    $('#eName').value.trim();

  if (!name) {
    return toast(
      'Exhibition name is required'
    );
  }

  const obj = {

    id: id || 'E' + Date.now(),

    name,

    date:
      $('#eDate').value,

    venue:
      $('#eVenue').value.trim()

  };

  if (id) {

    const i =
      data.exhibitions.findIndex(
        e => e.id === id
      );

    if (i >= 0) {
      data.exhibitions[i] = obj;
    }

  } else {

    data.exhibitions.push(obj);

  }

  save();

  closeModal();

  layout();

  toast('Exhibition saved');
}

function inviteCampaign(id) {

  const e =
    data.exhibitions.find(
      x => x.id === id
    );

  if (!e) return;

  openModal(

    'Exhibition Invite',

    `

    <div class="field">

      <label>
        Select Customer
      </label>

      <select
        class="select"
        id="campCustomer">

        ${
          data.customers.map(c => `

            <option value="${c.id}">
              ${esc(customerName(c))}
            </option>

          `).join('')
        }

      </select>

    </div>

    <div
      class="field"
      style="margin-top:12px">

      <label>
        Message
      </label>

      <textarea
        class="textarea"
        id="campMsg"
        rows="9"></textarea>

    </div>

    <div class="modal-actions">

      <button
        class="btn primary"
        onclick="sendCampaign('${id}')">
        🎪 Open WhatsApp
      </button>

    </div>

    `
  );

  const s =
    $('#campCustomer');

  if (!s) return;

  const up = () => {

    const c =
      customer(s.value);

    if (!c) return;

    $('#campMsg').value =
`Dear ${customerName(c)},

We are pleased to invite you to ${e.name}${
  e.venue ? ' at ' + e.venue : ''
}${
  e.date ? ' on ' + e.date : ''
}. 🎪

We would be delighted to meet you.

Regards,
SHREE JI GOLD CREATOR LLP`;

  };

  s.onchange = up;

  up();
}

function sendCampaign(id) {

  const c =
    customer($('#campCustomer').value);

  if (!c) return;

  wa(
    c.phone,
    $('#campMsg').value
  );

  data.messages.push({
    customerId: c.id,
    type: 'Exhibition Invitation',
    exhibitionId: id,
    date: dateNow()
  });

  save();

  closeModal();
}

function markExhibitionVisit(id) {

  toast(
    'Visit tracking is ready — connect each visitor to a customer from the next version.'
  );

}

/* --------------------------------------------------
   REVIEWS
-------------------------------------------------- */

function reviews() {

  const avg =
    data.reviews.length
    ?
    (
      data.reviews.reduce(
        (s, r) =>
          s + Number(r.rating || 0),
        0
      ) /
      data.reviews.length
    ).toFixed(1)
    :
    '0.0';

  return `

  <div class="page-head">

    <div>

      <div class="eyebrow">
        Customer Voice
      </div>

      <div class="title">
        Reviews
      </div>

      <div class="muted">
        Collect feedback and build a strong customer experience record.
      </div>

    </div>

  </div>

  <div
    class="grid stats"
    style="grid-template-columns:repeat(3,1fr)">

    <div class="card">

      <div class="stat-label">
        AVERAGE RATING
      </div>

      <div class="metric">
        ${avg} ⭐
      </div>

    </div>

    <div class="card">

      <div class="stat-label">
        TOTAL REVIEWS
      </div>

      <div class="metric">
        ${data.reviews.length}
      </div>

    </div>

    <div class="card">

      <div class="stat-label">
        5-STAR REVIEWS
      </div>

      <div class="metric">
        ${
          data.reviews.filter(
            r => Number(r.rating) === 5
          ).length
        }
      </div>

    </div>

  </div>

  <div class="card">

    <div class="section-title">
      Customer Feedback
    </div>

    <div class="list">

      ${
        data.reviews.slice().reverse().map(r => {

          const c =
            customer(r.customerId);

          return `

          <div class="list-row">

            <div>

              <b>
                ${esc(customerName(c))}
              </b>

              <div class="row-sub">
                ${esc(r.text || '')}
              </div>

            </div>

            <div>
              ${'⭐'.repeat(
                Number(r.rating || 0)
              )}
            </div>

          </div>

          `;

        }).join('')
        ||
        '<div class="empty">No reviews recorded yet.</div>'
      }

    </div>

  </div>

  `;
}

/* --------------------------------------------------
   REPORTS
-------------------------------------------------- */

function reports() {

  const total =
    data.orders.length;

  const del =
    data.orders.filter(
      o => o.status === 'Delivered'
    ).length;

  const repeat =
    data.customers.filter(
      c =>
        data.orders.filter(
          o => o.customerId === c.id
        ).length > 1
    ).length;

  const value =
    data.orders.reduce(
      (s, o) =>
        s + Number(o.value || 0),
      0
    );

  const deliveryPercent =
    total
    ? Math.round(del / total * 100)
    : 0;

  return `

  <div class="page-head">

    <div>

      <div class="eyebrow">
        Management Intelligence
      </div>

      <div class="title">
        Reports
      </div>

      <div class="muted">
        A clean snapshot for owner-level review.
      </div>

    </div>

  </div>

  <div class="grid three">

    <div class="card">

      <div class="stat-label">
        TOTAL ORDER VALUE
      </div>

      <div class="metric">
        ${money(value)}
      </div>

    </div>

    <div class="card">

      <div class="stat-label">
        DELIVERY SUCCESS
      </div>

      <div class="metric">
        ${deliveryPercent}%
      </div>

      <div
        class="progress"
        style="margin-top:12px">

        <span
          style="width:${deliveryPercent}%">
        </span>

      </div>

    </div>

    <div class="card">

      <div class="stat-label">
        REPEAT CUSTOMERS
      </div>

      <div class="metric">
        ${repeat}
      </div>

    </div>

  </div>

  <div
    class="grid two"
    style="margin-top:16px">

    <div class="card">

      <div class="section-title">
        Order Status
      </div>

      ${
        [
          'New',
          'Started',
          'Production',
          'Completed',
          'Hallmarking',
          'Ready',
          'Delivered'
        ].map(s => {

          const n =
            data.orders.filter(
              o => o.status === s
            ).length;

          const percent =
            total
            ? Math.round(n / total * 100)
            : 0;

          return `

          <div style="margin:13px 0">

            <div class="kpi-bar">

              <span>${s}</span>

              <b>${n}</b>

            </div>

            <div class="progress">

              <span
                style="width:${percent}%">
              </span>

            </div>

          </div>

          `;

        }).join('')
      }

    </div>

    <div class="card">

      <div class="section-title">
        Owner Follow-up Ideas
      </div>

      <div class="list">

        <div class="list-row">
          🎪
          <span>Exhibition visitors to follow up</span>
          <b>${data.customers.length}</b>
        </div>

        <div class="list-row">
          ⭐
          <span>Reviews to collect</span>
          <b>
            ${
              data.orders.filter(
                o => o.status === 'Delivered'
              ).length
            }
          </b>
        </div>

        <div class="list-row">
          🔁
          <span>Potential repeat customers</span>
          <b>${repeat}</b>
        </div>

      </div>

    </div>

  </div>

  `;
}

/* --------------------------------------------------
   SETTINGS
-------------------------------------------------- */

function settings() {

  return `

  <div class="page-head">

    <div>

      <div class="eyebrow">
        Administration
      </div>

      <div class="title">
        Settings
      </div>

      <div class="muted">
        Company profile, backup and app preferences.
      </div>

    </div>

  </div>

  <div class="grid two">

    <div class="card">

      <div class="section-title">
        🏢 Company Profile
      </div>

      <div class="form-grid">

        <div class="field full">

          <label>
            Company Name
          </label>

          <input
            class="input"
            id="companyName"
            value="SHREE JI GOLD CREATOR LLP">

        </div>

        <div class="field">

          <label>
            App Name
          </label>

          <input
            class="input"
            value="SHREE JI CONNECT"
            disabled>

        </div>

        <div class="field">

          <label>
            Currency
          </label>

          <input
            class="input"
            value="INR (₹)"
            disabled>

        </div>

      </div>

      <div class="modal-actions">

        <button
          class="btn primary"
          onclick="toast('Company branding saved')">
          Save Profile
        </button>

      </div>

    </div>

    <div class="card">

      <div class="section-title">
        💾 Data Backup
      </div>

      <p class="muted">
        Export your customer, order, exhibition and review data as a JSON backup.
      </p>

      <div class="actions">

        <button
          class="btn primary"
          onclick="exportData()">
          Export Backup
        </button>

        <button
          class="btn"
          onclick="importData()">
          Import Backup
        </button>

        <button
          class="btn danger"
          onclick="resetDemo()">
          Reset Demo Data
        </button>

      </div>

    </div>

  </div>

  <div class="footer-note">

    SHREE JI CONNECT •
    Built for SHREE JI GOLD CREATOR LLP •
    Data stored on this device

  </div>

  `;
}

/* --------------------------------------------------
   MODAL
-------------------------------------------------- */

function openModal(title, html) {

  if (!$('#modal')) return;

  $('#modalTitle').textContent =
    title;

  $('#modalBody').innerHTML =
    html;

  $('#modal').classList.remove(
    'hidden'
  );
}

function closeModal() {

  if ($('#modal')) {
    $('#modal').classList.add(
      'hidden'
    );
  }

}

/* --------------------------------------------------
   NAVIGATION
-------------------------------------------------- */

function setView(v) {

  view = v;

  if ($('#sidebar')) {
    $('#sidebar').classList.remove(
      'open'
    );
  }

  layout();
}

/* --------------------------------------------------
   BACKUP
-------------------------------------------------- */

function exportData() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type: 'application/json'
      }
    );

  const a =
    document.createElement('a');

  a.href =
    URL.createObjectURL(blob);

  a.download =
    'shree-ji-connect-backup-' +
    dateNow() +
    '.json';

  a.click();

  URL.revokeObjectURL(
    a.href
  );

  toast(
    'Backup exported'
  );
}

function importData() {

  const i =
    document.createElement('input');

  i.type = 'file';

  i.accept = '.json';

  i.onchange = () => {

    const f =
      i.files[0];

    if (!f) return;

    const r =
      new FileReader();

    r.onload = () => {

      try {

        data =
          JSON.parse(
            r.result
          );

        save();

        layout();

        toast(
          'Backup imported'
        );

      }

      catch {

        toast(
          'Invalid backup file'
        );

      }

    };

    r.readAsText(f);

  };

  i.click();
}

function resetDemo() {

  if (
    confirm(
      'Reset all app data to demo data?'
    )
  ) {

    data =
      JSON.parse(
        JSON.stringify(seed)
      );

    save();

    layout();

    toast(
      'Demo data restored'
    );

  }

}

/* --------------------------------------------------
   START APP
-------------------------------------------------- */

if ($('#modalClose')) {
  $('#modalClose').onclick =
    closeModal;
}

if ($('#modal')) {

  $('#modal').addEventListener(
    'click',
    e => {

      if (
        e.target.id === 'modal'
      ) {
        closeModal();
      }

    }
  );

}

if ($('#menuBtn')) {

  $('#menuBtn').onclick = () => {

    $('#sidebar').classList.toggle(
      'open'
    );

  };

}

document.addEventListener(
  'click',
  e => {

    const b =
      e.target.closest(
        '.nav-item'
      );

    if (b) {
      setView(
        b.dataset.view
      );
    }

  }
);

if ($('#notifyBtn')) {

  $('#notifyBtn').onclick = () =>
    toast(
      'No urgent notifications'
    );

}

layout();
