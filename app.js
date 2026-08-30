const KEY='sj_connect_data_v1';

const seed={
  customers:[
    {
      id:'C001',
      name:'Demo Jewellery',
      contactPerson:'Demo Customer',
      phone:'919876543210',
      alternate:'',
      city:'Coimbatore',
      address:'',
      state:'Tamil Nadu',
      exhibition:'',
      notes:'Sample record',
      created:'2026-08-27'
    }
  ],
  orders:[],
  exhibitions:[],
  reviews:[],
  messages:[]
};

let data=JSON.parse(localStorage.getItem(KEY)||'null')||seed;
let view='dashboard';
let selectedCustomer=null;

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function save(){
  localStorage.setItem(KEY,JSON.stringify(data));
}

function toast(msg){
  const t=$('#toast');
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}

function esc(v=''){
  return String(v).replace(/[&<>"']/g,c=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#039;'
  }[c]));
}

function dateNow(){
  return new Date().toISOString().slice(0,10);
}

function money(v){
  return '₹'+Number(v||0).toLocaleString('en-IN');
}

function wa(phone,msg){
  let p=String(phone||'').replace(/\D/g,'');
  if(p.length===10)p='91'+p;
  if(!p){toast('WhatsApp number not available');return;}
  window.open(
    'https://wa.me/'+p+'?text='+encodeURIComponent(msg),
    '_blank'
  );
}

function customer(id){
  return data.customers.find(c=>c.id===id);
}

const templates=[
  ['🎪','Exhibition Invitation','Invite a customer to your exhibition'],
  ['🎉','Festival Greeting','Festival greeting with image option'],
  ['🙏','Stall Visit Thank You','Thank them for visiting your stall'],
  ['💎','Order Thank You','Thank them for placing an order'],
  ['🏭','Order Started','Production has started'],
  ['✅','Order Completed','Order is completed'],
  ['📦','Ready for Delivery','Order is ready'],
  ['🚚','Delivery Update','Delivery status update'],
  ['⭐','Review Request','Ask for customer feedback'],
  ['🔁','Repeat Order','Reconnect for a new order'],
  ['✨','New Collection','Announce a new collection'],
  ['📅','Follow-up','Friendly follow-up message']
];

function msgFor(type,c,o={}){
  const name=c?.contactPerson||c?.name||'Customer';
  const order=o.orderNo||o.id||'your order';

  const map={
    'Exhibition Invitation':
`Dear ${name},

We are pleased to invite you to visit SHREE JI GOLD CREATOR LLP at our upcoming exhibition. We would be delighted to meet you and showcase our latest collections.

We look forward to welcoming you.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Festival Greeting':
`Dear ${name},

Warm festival wishes from SHREE JI GOLD CREATOR LLP! ✨
May this festive season bring happiness, prosperity and success to you and your family.

With best wishes,
SHREE JI GOLD CREATOR LLP`,

    'Stall Visit Thank You':
`Dear ${name},

Thank you for visiting the SHREE JI GOLD CREATOR LLP stall. It was a pleasure meeting you. 🙏
We truly appreciate your valuable time and interest in our products.

We look forward to serving you again.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Order Thank You':
`Dear ${name},

Thank you for placing your order with SHREE JI GOLD CREATOR LLP. 💎
Your order ${order} has been registered successfully. We sincerely appreciate your trust and support.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Order Started':
`Dear ${name},

A quick update from SHREE JI GOLD CREATOR LLP: your order ${order} has now been started in production. 🏭
We will keep you updated on the progress.

Thank you for your trust.`,

    'Order Completed':
`Dear ${name},

Good news! Your order ${order} has been completed successfully. ✅
We will update you regarding the next step shortly.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Ready for Delivery':
`Dear ${name},

Your order ${order} is ready for delivery. 📦
Please contact us if you need any assistance regarding delivery arrangements.

Thank you,
SHREE JI GOLD CREATOR LLP`,

    'Delivery Update':
`Dear ${name},

This is an update regarding your order ${order}. 🚚
Your delivery is being arranged. We will coordinate the delivery details with you.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Review Request':
`Dear ${name},

Thank you for choosing SHREE JI GOLD CREATOR LLP. ⭐
We would love to know about your experience with us. Your feedback helps us improve and serve you better.

Thank you for your valuable support.`,

    'Repeat Order':
`Dear ${name},

We hope you are doing well. It has been a pleasure serving you. 💎
If you have any upcoming requirements or repeat orders, please feel free to contact us. We would be happy to assist you.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'New Collection':
`Dear ${name},

We are excited to share our latest collection from SHREE JI GOLD CREATOR LLP. ✨
If you would like to see the new designs, please let us know.

Regards,
SHREE JI GOLD CREATOR LLP`,

    'Follow-up':
`Dear ${name},

Greetings from SHREE JI GOLD CREATOR LLP. Just following up regarding your recent enquiry/order.
Please let us know if you need any assistance.

Regards,
SHREE JI GOLD CREATOR LLP`
  };

  return map[type]||'';
}

function layout(){
  const m=$('#main');

  const render={
    dashboard:dashboard,
    customers:customers,
    orders:orders,
    whatsapp:whatsapp,
    exhibitions:exhibitions,
    reviews:reviews,
    reports:reports,
    settings:settings
  }[view];

  m.innerHTML=render();

  $$('.nav-item').forEach(
    b=>b.classList.toggle('active',b.dataset.view===view)
  );
}

function dashboard(){
  const active=data.orders.filter(o=>!['Delivered','Cancelled'].includes(o.status)).length;
  const done=data.orders.filter(o=>o.status==='Delivered').length;
  const pending=data.orders.filter(o=>o.status!=='Delivered').length;
  const value=data.orders.reduce((s,o)=>s+Number(o.value||0),0);

  return `
  <div class="hero">
    <div class="eyebrow">Owner Dashboard</div>
    <h2>SHREE JI GOLD CREATOR LLP</h2>
    <div class="muted">Customer relationships, orders and WhatsApp communication — all in one place.</div>
    <div class="quick">
      <button class="btn primary" onclick="openCustomer()">➕ Add Customer</button>
      <button class="btn" onclick="openOrder()">📦 New Order</button>
      <button class="btn" onclick="setView('whatsapp')">💬 WhatsApp Center</button>
      <button class="btn" onclick="openExhibition()">🎪 New Exhibition</button>
    </div>
  </div>

  <div class="grid stats">
    <div class="card"><div class="stat-label">TOTAL CUSTOMERS</div><div class="stat-value">${data.customers.length}</div><div class="stat-note">● CRM database</div></div>
    <div class="card"><div class="stat-label">ACTIVE ORDERS</div><div class="stat-value">${active}</div><div class="stat-note">● In progress</div></div>
    <div class="card"><div class="stat-label">COMPLETED</div><div class="stat-value">${done}</div><div class="stat-note">● Delivered</div></div>
    <div class="card"><div class="stat-label">PENDING DELIVERY</div><div class="stat-value">${pending}</div><div class="stat-note">● Requires attention</div></div>
    <div class="card"><div class="stat-label">ORDER VALUE</div><div class="stat-value">${money(value)}</div><div class="stat-note">● Existing recorded data</div></div>
  </div>

  <div class="grid two">
    <div class="card">
      <div class="section-title">📦 Recent Orders</div>
      ${
        data.orders.length
        ? `<div class="list">${data.orders.slice(-5).reverse().map(o=>`
            <div class="list-row">
              <div class="row-main">
                <div class="row-title">${esc(o.orderNo)} • ${esc(customer(o.customerId)?.name||'Unknown')}</div>
                <div class="row-sub">${esc(o.startDate||o.orderDate||'-')}</div>
              </div>
              <span class="pill ${o.status==='Delivered'?'green':o.status==='Completed'?'blue':'gold'}">${esc(o.status)}</span>
            </div>`).join('')}</div>`
        : `<div class="empty">No orders yet. Create your first order.</div>`
      }
    </div>
    <div class="card">
      <div class="section-title">⭐ Recent Reviews</div>
      ${
        data.reviews.length
        ? `<div class="list">${data.reviews.slice(-5).reverse().map(r=>`
            <div class="list-row">
              <div><b>${esc(customer(r.customerId)?.name||'Customer')}</b><div class="row-sub">${esc(r.text||'No comment')}</div></div>
              <span>${'⭐'.repeat(Number(r.rating||0))}</span>
            </div>`).join('')}</div>`
        : `<div class="empty">Reviews will appear here after delivery.</div>`
      }
    </div>
  </div>`;
}

/* =========================================================
   CUSTOMERS
========================================================= */

function customers(){
  return `
  <div class="page-head">
    <div>
      <div class="eyebrow">CRM</div>
      <div class="title">Customers</div>
      <div class="muted">Every party, contact person and relationship in one place.</div>
    </div>
    <button class="btn primary" onclick="openCustomer()">➕ Add Customer</button>
  </div>

  <div class="searchbar">
    <input class="input" id="customerSearch" placeholder="Search party, contact person, WhatsApp number or city..." oninput="filterCustomers()">
  </div>

  <div class="card table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Party Name</th>
          <th>Contact Person</th>
          <th>WhatsApp</th>
          <th>City</th>
          <th>Orders</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="customerRows">${customerRows(data.customers)}</tbody>
    </table>
  </div>`;
}

function customerRows(list){
  return list.map(c=>`
    <tr>
      <td><b>${esc(c.name)}</b></td>
      <td>${esc(c.contactPerson||'-')}</td>
      <td>${esc(c.phone)}</td>
      <td>${esc(c.city||'-')}</td>
      <td>${data.orders.filter(o=>o.customerId===c.id).length}</td>
      <td>
        <div class="actions">
          <button class="btn" onclick="viewCustomer('${c.id}')">View</button>
          <button class="btn whatsapp" onclick="quickWhatsApp('${c.id}')">WhatsApp</button>
          <button class="btn danger" onclick="deleteCustomer('${c.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('')||`<tr><td colspan="6" class="empty">No customers found.</td></tr>`;
}

/* =========================================================
   ADD / EDIT CUSTOMER
========================================================= */

function openCustomer(existing){
  const c=existing||{};

  openModal(
    existing?'Edit Customer':'Add Customer',
    `
    <div class="form-grid">
      <div class="field full">
        <label>Party Name *</label>
        <input class="input" id="fName" placeholder="Company / Shop / Party Name" value="${esc(c.name||'')}">
      </div>

      <div class="field">
        <label>Contact Person</label>
        <input class="input" id="fContact" placeholder="Contact Person Name" value="${esc(c.contactPerson||'')}">
      </div>

      <div class="field">
        <label>WhatsApp Number *</label>
        <input class="input" id="fPhone" inputmode="tel" placeholder="10 digit WhatsApp number" value="${esc(c.phone||'')}">
      </div>

      <div class="field">
        <label>Alternate Number</label>
        <input class="input" id="fAlternate" inputmode="tel" placeholder="Alternate mobile number" value="${esc(c.alternate||'')}">
      </div>

      <div class="field">
        <label>City</label>
        <input class="input" id="fCity" value="${esc(c.city||'')}">
      </div>

      <div class="field full">
        <label>Address</label>
        <textarea class="textarea" id="fAddress" placeholder="Full address">${esc(c.address||'')}</textarea>
      </div>

      <div class="field">
        <label>State</label>
        <input class="input" id="fState" value="${esc(c.state||'Tamil Nadu')}">
      </div>

      <div class="field">
        <label>Exhibition</label>
        <input class="input" id="fExhibition" placeholder="Exhibition name" value="${esc(c.exhibition||'')}">
      </div>

      <div class="field full">
        <label>Notes</label>
        <textarea class="textarea" id="fNotes" placeholder="Customer notes">${esc(c.notes||'')}</textarea>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveCustomer('${c.id||''}')">Save Customer</button>
    </div>
    `
  );
}

function saveCustomer(id){
  const name=$('#fName').value.trim();
  const phone=$('#fPhone').value.trim();

  if(!name||!phone)
    return toast('Party Name and WhatsApp number are required');

  const old=id?data.customers.find(c=>c.id===id):null;

  const obj={
    id:id||'C'+Date.now().toString().slice(-7),
    name,
    contactPerson:$('#fContact').value.trim(),
    phone,
    alternate:$('#fAlternate').value.trim(),
    city:$('#fCity').value.trim(),
    address:$('#fAddress').value.trim(),
    state:$('#fState').value.trim(),
    exhibition:$('#fExhibition').value.trim(),
    notes:$('#fNotes').value.trim(),
    created:old?.created||dateNow()
  };

  if(id){
    const i=data.customers.findIndex(c=>c.id===id);
    if(i>=0) data.customers[i]=obj;
  }else{
    data.customers.push(obj);
  }

  save();
  closeModal();
  layout();

  toast(id?'Customer updated':'Customer added successfully');
}

function deleteCustomer(id){
  if(!confirm('Delete this customer?')) return;

  data.customers=data.customers.filter(c=>c.id!==id);
  data.orders=data.orders.filter(o=>o.customerId!==id);

  save();
  layout();
  toast('Customer deleted');
}

function viewCustomer(id){
  const c=customer(id);
  const os=data.orders.filter(o=>o.customerId===id);

  openModal(
    c.name,
    `
    <div class="grid two">
      <div class="card">
        <div class="section-title">Customer Details</div>
        <p><b>Party Name:</b> ${esc(c.name)}</p>
        <p><b>Contact Person:</b> ${esc(c.contactPerson||'-')}</p>
        <p><b>WhatsApp:</b> ${esc(c.phone)}</p>
        <p><b>Alternate:</b> ${esc(c.alternate||'-')}</p>
        <p><b>City:</b> ${esc(c.city||'-')}</p>
        <p><b>Address:</b> ${esc(c.address||'-')}</p>
        <p><b>State:</b> ${esc(c.state||'-')}</p>
        <p><b>Exhibition:</b> ${esc(c.exhibition||'-')}</p>
        <p><b>Notes:</b> ${esc(c.notes||'-')}</p>

        <div class="actions">
          <button class="btn whatsapp" onclick="quickWhatsApp('${id}')">💬 WhatsApp</button>
          <button class="btn" onclick="openCustomer(customer('${id}'));closeModal()">Edit</button>
        </div>
      </div>

      <div class="card">
        <div class="section-title">📜 Customer Timeline</div>
        <div class="timeline">
          ${
            os.map(o=>`
              <div class="event">
                <b>${esc(o.status)}</b>
                <div class="row-sub">Order ${esc(o.orderNo)}</div>
                <small>${esc(o.startDate||o.orderDate||'-')}</small>
              </div>
            `).join('')||'<div class="muted">No orders yet.</div>'
          }
        </div>
      </div>
    </div>
    `
  );
}

function quickWhatsApp(id){
  const c=customer(id);
  wa(c.phone,msgFor('Follow-up',c));

  data.messages.push({customerId:id,type:'Follow-up',date:dateNow()});
  save();

  toast('WhatsApp opened');
}

function filterCustomers(){
  const q=$('#customerSearch').value.toLowerCase();

  $('#customerRows').innerHTML=customerRows(
    data.customers.filter(c=>
      [c.name,c.contactPerson,c.phone,c.alternate,c.city,c.address,c.state,c.exhibition,c.notes]
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  );
}

/* =========================================================
   WHATSAPP
========================================================= */

function whatsapp(){
  return `
  <div class="page-head">
    <div>
      <div class="eyebrow">Communication</div>
      <div class="title">WhatsApp Center</div>
      <div class="muted">Choose a ready-made business message, then open WhatsApp with one tap.</div>
    </div>
  </div>

  <div class="notice">⚡ Messages are prepared for you. WhatsApp opens for final review and sending.</div>

  <div class="grid template-grid" style="margin-top:16px">
    ${templates.map(t=>`
      <div class="card template" onclick="openWhatsAppTemplate('${esc(t[1])}')">
        <div class="template-icon">${t[0]}</div>
        <h4>${esc(t[1])}</h4>
        <p>${esc(t[2])}</p>
      </div>
    `).join('')}
  </div>`;
}

function openWhatsAppTemplate(type){
  const opts=data.customers.map(c=>
    `<option value="${c.id}">${esc(c.name)}${c.contactPerson?' — '+esc(c.contactPerson):''} — ${esc(c.phone)}</option>`
  ).join('');

  openModal(
    type,
    `
    <div class="field">
      <label>Customer</label>
      <select class="select" id="waCustomer">${opts||'<option>No customers</option>'}</select>
    </div>

    <div class="field" style="margin-top:12px">
      <label>Message Preview</label>
      <textarea class="textarea" id="waPreview" rows="12"></textarea>
    </div>

    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="sendTemplate('${esc(type)}')">💬 Open WhatsApp</button>
    </div>
    `
  );

  const s=$('#waCustomer');
  const update=()=>{
    const c=customer(s.value);
    $('#waPreview').value=msgFor(type,c);
  };

  s.onchange=update;
  update();
}

function sendTemplate(type){
  const c=customer($('#waCustomer').value);
  if(!c) return;

  wa(c.phone,$('#waPreview').value);

  data.messages.push({customerId:c.id,type,date:dateNow()});
  save();
  closeModal();
}

/* =========================================================
   ORDERS  (unchanged — already correct)
========================================================= */

function orders(){
  return `
  <div class="page-head">
    <div>
      <div class="eyebrow">Production</div>
      <div class="title">Orders</div>
      <div class="muted">Track every order from start to delivery.</div>
    </div>
    <button class="btn primary" onclick="openOrder()">➕ New Order</button>
  </div>

  <div class="card table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Order</th><th>Order Date</th><th>Customer</th><th>Type</th>
          <th>Weight</th><th>Advance</th><th>Status</th><th>Delivery</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${
          data.orders.slice().reverse().map(o=>`
          <tr>
            <td><b>${esc(o.orderNo||'-')}</b></td>
            <td>${esc(o.orderDate||'-')}</td>
            <td>${esc(customer(o.customerId)?.name||'-')}</td>
            <td>${esc(o.type||'-')}</td>
            <td>${esc(o.weight||'-')} g</td>
            <td>${money(o.advance)}</td>
            <td><span class="pill ${o.status==='Delivered'?'green':o.status==='Completed'?'blue':'gold'}">${esc(o.status||'New')}</span></td>
            <td>${esc(o.deliveryDate||'-')}</td>
            <td>
              <div class="actions">
                <button class="btn" onclick="editOrder('${o.id}')">Edit</button>
                <button class="btn" onclick="orderWhatsApp('${o.id}')">💬</button>
              </div>
            </td>
          </tr>
          `).join('')||`<tr><td colspan="9" class="empty">No orders yet.</td></tr>`
        }
      </tbody>
    </table>
  </div>`;
}

function openOrder(existing){
  const o=existing||{};

  const opts=data.customers.map(c=>
    `<option value="${c.id}" ${c.id===o.customerId?'selected':''}>${esc(c.name)} — ${esc(c.phone)}</option>`
  ).join('');

  openModal(
    existing?'Order Edit':'New Order',
    `
    <div class="form-grid">
      <div class="field">
        <label>Order Number *</label>
        <input class="input" id="oNo" value="${esc(o.orderNo||'SJ-'+new Date().getFullYear()+'-'+String(data.orders.length+1).padStart(4,'0'))}">
      </div>

      <div class="field">
        <label>Order Date *</label>
        <input class="input" type="date" id="oDate" value="${esc(o.orderDate||dateNow())}">
      </div>

      <div class="field">
        <label>Customer *</label>
        <select class="select" id="oCustomer">${opts||'<option value="">Add customer first</option>'}</select>
      </div>

      <div class="field">
        <label>Type</label>
        <select class="select" id="oType">
          <option value="Direct" ${o.type==='Direct'||!o.type?'selected':''}>Direct</option>
          <option value="SM" ${o.type==='SM'?'selected':''}>SM</option>
        </select>
      </div>

      <div class="field">
        <label>Weight (g) *</label>
        <input class="input" type="number" step="0.001" id="oWeight" value="${esc(o.weight||'')}">
      </div>

      <div class="field">
        <label>Touch *</label>
        <input class="input" id="oTouch" value="${esc(o.touch||'')}">
      </div>

      <div class="field">
        <label>Screw Type</label>
        <input class="input" id="oScrew" value="${esc(o.screw||'')}">
      </div>

      <div class="field">
        <label>Lady's Ring Size *</label>
        <input class="input" id="oLadyRing" placeholder="Example: 9 to 15" value="${esc(o.ladyRing||'')}">
      </div>

      <div class="field">
        <label>Gent's Ring Size *</label>
        <input class="input" id="oGentRing" placeholder="Example: 17 to 25" value="${esc(o.gentRing||'')}">
      </div>

      <div class="field">
        <label>HUID *</label>
        <select class="select" id="oHuid">
          <option value="Yes" ${o.huid==='Yes'||!o.huid?'selected':''}>Yes</option>
          <option value="No" ${o.huid==='No'?'selected':''}>No</option>
        </select>
      </div>

      <div class="field">
        <label>Advance Mode</label>
        <select class="select" id="oAdvanceMode">
          <option value="Cash" ${o.advanceMode==='Cash'||!o.advanceMode?'selected':''}>Cash</option>
          <option value="UPI" ${o.advanceMode==='UPI'?'selected':''}>UPI</option>
          <option value="Bank" ${o.advanceMode==='Bank'?'selected':''}>Bank</option>
        </select>
      </div>

      <div class="field">
        <label>Advance Amount (₹) *</label>
        <input class="input" type="number" step="0.01" id="oAdvance" value="${esc(o.advance||'')}">
      </div>

      <div class="field">
        <label>Start Date</label>
        <input class="input" type="date" id="oStart" value="${esc(o.startDate||'')}">
      </div>

      <div class="field">
        <label>Delivered Date</label>
        <input class="input" type="date" id="oDelivery" value="${esc(o.deliveryDate||'')}">
      </div>

      <div class="field">
        <label>Status</label>
        <select class="select" id="oStatus">
          ${['New','Started','Production','Completed','Hallmarking','Ready','Delivered','Cancelled']
            .map(s=>`<option ${s===(o.status||'New')?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>

      <div class="field full">
        <label>Notes</label>
        <textarea class="textarea" id="oNotes">${esc(o.notes||'')}</textarea>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveOrder('${o.id||''}')">${existing?'Update Order':'Save Order'}</button>
    </div>
    `
  );
}

function saveOrder(id){
  const customerId=$('#oCustomer').value;
  const orderNo=$('#oNo').value.trim();
  const orderDate=$('#oDate').value;
  const weight=$('#oWeight').value.trim();
  const touch=$('#oTouch').value.trim();
  const ladyRing=$('#oLadyRing').value.trim();
  const gentRing=$('#oGentRing').value.trim();
  const advance=$('#oAdvance').value.trim();

  if(!customerId) return toast('Select a customer');
  if(!orderNo) return toast('Order Number is required');
  if(!orderDate) return toast('Order Date is required');
  if(!weight) return toast('Weight is required');
  if(!touch) return toast('Touch is required');
  if(!ladyRing) return toast("Lady's Ring Size is required");
  if(!gentRing) return toast("Gent's Ring Size is required");
  if(!advance) return toast('Advance Amount is required');

  const obj={
    id:id||'O'+Date.now(),
    customerId,
    orderNo,
    orderDate,
    type:$('#oType').value,
    weight,
    touch,
    screw:$('#oScrew').value.trim(),
    ladyRing,
    gentRing,
    huid:$('#oHuid').value,
    advanceMode:$('#oAdvanceMode').value,
    advance:Number(advance||0),
    startDate:$('#oStart').value,
    deliveryDate:$('#oDelivery').value,
    status:$('#oStatus').value,
    notes:$('#oNotes').value.trim()
  };

  if(id){
    const i=data.orders.findIndex(o=>o.id===id);
    if(i!==-1) data.orders[i]=obj;
  }else{
    data.orders.push(obj);
  }

  save();
  closeModal();
  layout();

  toast(id?'Order updated':'Order created successfully');
}

function editOrder(id){
  openOrder(data.orders.find(o=>o.id===id));
}

function orderWhatsApp(id){
  const o=data.orders.find(o=>o.id===id);
  const c=customer(o.customerId);

  const type=
    o.status==='Started'||o.status==='Production' ? 'Order Started' :
    o.status==='Completed' ? 'Order Completed' :
    o.status==='Ready' ? 'Ready for Delivery' :
    o.status==='Delivered' ? 'Delivery Update' :
    'Order Thank You';

  wa(c.phone,msgFor(type,c,o));

  data.messages.push({customerId:c.id,type,date:dateNow(),orderId:id});
  save();

  toast('WhatsApp opened');
}

/* =========================================================
   EXHIBITIONS
========================================================= */

function exhibitions(){
  return `
  <div class="page-head">
    <div>
      <div class="eyebrow">Campaigns</div>
      <div class="title">Exhibitions</div>
      <div class="muted">Invite customers, track visits and convert follow-ups into orders.</div>
    </div>
    <button class="btn primary" onclick="openExhibition()">➕ New Exhibition</button>
  </div>

  <div class="grid three">
    ${
      data.exhibitions.map(e=>`
      <div class="card">
        <div class="eyebrow">${esc(e.date||'-')}</div>
        <h3>${esc(e.name)}</h3>
        <div class="muted">📍 ${esc(e.venue||'-')}</div>
        <div style="margin-top:15px" class="actions">
          <button class="btn" onclick="inviteCampaign('${e.id}')">🎪 Invite</button>
          <button class="btn" onclick="markExhibitionVisit('${e.id}')">👣 Visit</button>
        </div>
      </div>
      `).join('')||`<div class="card empty" style="grid-column:1/-1">No exhibitions yet. Create one to start a campaign.</div>`
    }
  </div>`;
}

function openExhibition(existing){
  const e=existing||{};

  openModal(
    existing?'Edit Exhibition':'New Exhibition',
    `
    <div class="form-grid">
      <div class="field">
        <label>Exhibition Name *</label>
        <input class="input" id="eName" value="${esc(e.name||'')}">
      </div>
      <div class="field">
        <label>Date</label>
        <input class="input" type="date" id="eDate" value="${esc(e.date||'')}">
      </div>
      <div class="field full">
        <label>Venue</label>
        <input class="input" id="eVenue" value="${esc(e.venue||'')}">
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn" onclick="closeModal()">Cancel</button>
      <button class="btn primary" onclick="saveExhibition('${e.id||''}')">Save Exhibition</button>
    </div>
    `
  );
}

function saveExhibition(id){
  const name=$('#eName').value.trim();
  if(!name) return toast('Exhibition name is required');

  const obj={
    id:id||'E'+Date.now(),
    name,
    date:$('#eDate').value,
    venue:$('#eVenue').value.trim()
  };

  if(id){
    data.exhibitions[data.exhibitions.findIndex(e=>e.id===id)]=obj;
  }else{
    data.exhibitions.push(obj);
  }

  save();
  closeModal();
  layout();
  toast('Exhibition saved');
}

function inviteCampaign(id){
  const e=data.exhibitions.find(x=>x.id===id);

  openModal(
    'Exhibition Invite',
    `
    <div class="field">
      <label>Select Customer</label>
      <select class="select" id="campCustomer">
        ${data.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}
      </select>
    </div>

    <div class="field" style="margin-top:12px">
      <label>Message</label>
      <textarea class="textarea" id="campMsg" rows="9"></textarea>
    </div>

    <div class="modal-actions">
      <button class="btn primary" onclick="sendCampaign('${id}')">🎪 Open WhatsApp</button>
    </div>
    `
  );

  const s=$('#campCustomer');
  const up=()=>{
    const c=customer(s.value);
    $('#campMsg').value=
`Dear ${c.contactPerson||c.name},

We are pleased to invite you to ${e.name}${e.venue?' at '+e.venue:''}${e.date?' on '+e.date:''}. 🎪

We would be delighted to meet you.

Regards,
SHREE JI GOLD CREATOR LLP`;
  };

  s.onchange=up;
  up();
}

function sendCampaign(id){
  const c=customer($('#campCustomer').value);
  wa(c.phone,$('#campMsg').value);

  data.messages.push({customerId:c.id,type:'Exhibition Invitation',exhibitionId:id,date:dateNow()});
  save();
  closeModal();
}

function markExhibitionVisit(id){
  toast('Visit tracking is ready — connect each visitor to a customer from the next version.');
}

/* =========================================================
   REVIEWS
========================================================= */

function reviews(){
  const avg=data.reviews.length
    ? (data.reviews.reduce((s,r)=>s+Number(r.rating||0),0)/data.reviews.length).toFixed(1)
    : '0.0';

  return `
  <div class="page-head">
    <div>
      <div class="eyebrow">Customer Voice</div>
      <div class="title">Reviews</div>
      <div class="muted">Collect feedback and build a strong customer experience record.</div>
    </div>
  </div>

  <div class="grid stats" style="grid-template-columns:repeat(3,1fr)">
    <div class="card"><div class="stat-label">AVERAGE RATING</div><div class="metric">${avg} ⭐</div></div>
    <div class="card"><div class="stat-label">TOTAL REVIEWS</div><div class="metric">${data.reviews.length}</div></div>
    <div class="card"><div class="stat-label">5-STAR REVIEWS</div><div class="metric">${data.reviews.filter(r=>Number(r.rating)===5).length}</div></div>
  </div>

  <div class="card">
    <div class="section-title">Customer Feedback</div>
    <div class="list">
      ${
        data.reviews.slice().reverse().map(r=>`
        <div class="list-row">
          <div><b>${esc(customer(r.customerId)?.name||'Customer')}</b><div class="row-sub">${esc(r.text||'')}</div></div>
          <div>${'⭐'.repeat(Number(r.rating||0))}</div>
        </div>
        `).join('')||'<div class="empty">No reviews recorded yet.</div>'
      }
    </div>
  </div>`;
}

/* =========================================================
   REPORTS
========================================================= */

function reports(){

  const totalOrders = data.orders.length;

  const totalWeight = data.orders.reduce(
    (sum,o)=>sum + Number(o.weight||0),
    0
  );

  const directCount = data.orders.filter(
    o=>o.type==='Direct'
  ).length;

  const smCount = data.orders.filter(
    o=>o.type==='SM'
  ).length;

  const pendingCount = data.orders.filter(
    o=>o.status==='New' ||
       o.status==='Pending'
  ).length;

  const startedCount = data.orders.filter(
    o=>o.status==='Started' ||
       o.status==='Production'
  ).length;

  const finishedCount = data.orders.filter(
    o=>o.status==='Completed' ||
       o.status==='Ready' ||
       o.status==='Delivered'
  ).length;

  const cancelledCount = data.orders.filter(
    o=>o.status==='Cancelled'
  ).length;


  return `
  <div class="page-head">

    <div>
      <div class="eyebrow">Database Reports</div>

      <div class="title">
        Reports
      </div>

      <div class="muted">
        Order database summary, customer summary and date-wise reports.
      </div>
    </div>

  </div>


  <!-- SUMMARY -->

  <div class="grid stats">

    <div class="card">
      <div class="stat-label">
        TOTAL ORDERS
      </div>

      <div class="stat-value">
        ${totalOrders}
      </div>
    </div>


    <div class="card">
      <div class="stat-label">
        TOTAL WEIGHT
      </div>

      <div class="stat-value">
        ${totalWeight.toFixed(3)} g
      </div>
    </div>


    <div class="card">
      <div class="stat-label">
        DIRECT
      </div>

      <div class="stat-value">
        ${directCount}
      </div>
    </div>


    <div class="card">
      <div class="stat-label">
        SM
      </div>

      <div class="stat-value">
        ${smCount}
      </div>
    </div>


    <div class="card">
      <div class="stat-label">
        PENDING
      </div>

      <div class="stat-value">
        ${pendingCount}
      </div>
    </div>


    <div class="card">
      <div class="stat-label">
        STARTED
      </div>

      <div class="stat-value">
        ${startedCount}
      </div>
    </div>


    <div class="card">
      <div class="stat-label">
        FINISHED
      </div>

      <div class="stat-value">
        ${finishedCount}
      </div>
    </div>


    <div class="card">
      <div class="stat-label">
        CANCELLED
      </div>

      <div class="stat-value">
        ${cancelledCount}
      </div>
    </div>

  </div>


  <!-- SEARCH / FILTER -->

  <div class="card" style="margin-top:16px">

    <div class="section-title">
      🔎 Search / Filter
    </div>

    <div class="form-grid">

      <div class="field">

        <label>Search</label>

        <input
          class="input"
          id="reportSearch"
          placeholder="Order No / Customer / Phone..."
          oninput="filterReport()">

      </div>


      <div class="field">

        <label>Type</label>

        <select
          class="select"
          id="reportType"
          onchange="filterReport()">

          <option value="">All Types</option>
          <option value="Direct">Direct</option>
          <option value="SM">SM</option>

        </select>

      </div>


      <div class="field">

        <label>Status</label>

        <select
          class="select"
          id="reportStatus"
          onchange="filterReport()">

          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Started">Started</option>
          <option value="Production">Production</option>
          <option value="Completed">Completed</option>
          <option value="Hallmarking">Hallmarking</option>
          <option value="Ready">Ready</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>

        </select>

      </div>


      <div class="field">

        <label>From Date</label>

        <input
          class="input"
          type="date"
          id="reportFrom"
          onchange="filterReport()">

      </div>


      <div class="field">

        <label>To Date</label>

        <input
          class="input"
          type="date"
          id="reportTo"
          onchange="filterReport()">

      </div>

    </div>


    <div class="actions" style="margin-top:16px">

      <button
        class="btn"
        onclick="clearReportFilter()">
        Clear Filter
      </button>

      <button
        class="btn primary"
        onclick="printReport()">
        🖨️ Print Report
      </button>

    </div>

  </div>


  <!-- ORDER REPORT -->

  <div
    class="card table-wrap"
    style="margin-top:16px">

    <div class="section-title">
      📦 Order Database
    </div>

    <table class="table">

      <thead>

        <tr>

          <th>Order No</th>

          <th>Order Date</th>

          <th>Customer</th>

          <th>Type</th>

          <th>Weight</th>

          <th>Touch</th>

          <th>Advance</th>

          <th>Status</th>

          <th>Delivery</th>

        </tr>

      </thead>


      <tbody id="reportRows">

        ${reportOrderRows(data.orders)}

      </tbody>

    </table>

  </div>


  <!-- CUSTOMER SUMMARY -->

  <div
    class="card table-wrap"
    style="margin-top:16px">

    <div class="section-title">
      👥 Customer Summary
    </div>

    <table class="table">

      <thead>

        <tr>

          <th>Customer</th>

          <th>WhatsApp</th>

          <th>Shop / Company</th>

          <th>Orders</th>

          <th>Total Weight</th>

          <th>Total Advance</th>

        </tr>

      </thead>


      <tbody>

        ${
          data.customers.map(c=>{

            const orders=data.orders.filter(
              o=>o.customerId===c.id
            );

            const weight=orders.reduce(
              (s,o)=>s+Number(o.weight||0),
              0
            );

            const advance=orders.reduce(
              (s,o)=>s+Number(o.advance||0),
              0
            );

            return `

            <tr>

              <td>
                <b>${esc(c.name)}</b>
              </td>

              <td>
                ${esc(c.phone)}
              </td>

              <td>
                ${esc(c.shop||'-')}
              </td>

              <td>
                ${orders.length}
              </td>

              <td>
                ${weight.toFixed(3)} g
              </td>

              <td>
                ${money(advance)}
              </td>

            </tr>

            `;

          }).join('') ||

          `
          <tr>
            <td
              colspan="6"
              class="empty">
              No customers
            </td>
          </tr>
          `
        }

      </tbody>

    </table>

  </div>


  <!-- EXHIBITION SUMMARY -->

  <div
    class="card table-wrap"
    style="margin-top:16px">

    <div class="section-title">
      🎪 Exhibition Summary
    </div>

    <table class="table">

      <thead>

        <tr>

          <th>Exhibition</th>

          <th>Date</th>

          <th>Venue</th>

        </tr>

      </thead>


      <tbody>

        ${
          data.exhibitions.map(e=>`

          <tr>

            <td>
              <b>${esc(e.name)}</b>
            </td>

            <td>
              ${esc(e.date||'-')}
            </td>

            <td>
              ${esc(e.venue||'-')}
            </td>

          </tr>

          `).join('') ||

          `
          <tr>
            <td
              colspan="3"
              class="empty">
              No exhibitions
            </td>
          </tr>
          `
        }

      </tbody>

    </table>

  </div>


  <!-- DATE WISE REPORT -->

  <div
    class="card table-wrap"
    style="margin-top:16px">

    <div class="section-title">
      📅 Date-wise Report
    </div>

    <table class="table">

      <thead>

        <tr>

          <th>Date</th>

          <th>Orders</th>

          <th>Total Weight</th>

          <th>Direct</th>

          <th>SM</th>

        </tr>

      </thead>


      <tbody>

        ${
          dateWiseReport()
        }

      </tbody>

    </table>

  </div>

  `;
}


/* =========================================================
   REPORT ORDER ROWS
   ========================================================= */

function reportOrderRows(list){

  if(!list.length){

    return `
    <tr>

      <td
        colspan="9"
        class="empty">

        No orders found.

      </td>

    </tr>
    `;

  }


  return list.map(o=>{

    const c=customer(o.customerId);

    return `

    <tr>

      <td>
        <b>${esc(o.orderNo||'-')}</b>
      </td>

      <td>
        ${esc(o.orderDate||'-')}
      </td>

      <td>
        ${esc(c?.name||'-')}
      </td>

      <td>
        ${esc(o.type||'-')}
      </td>

      <td>
        ${esc(o.weight||'0')} g
      </td>

      <td>
        ${esc(o.touch||'-')}
      </td>

      <td>
        ${money(o.advance)}
      </td>

      <td>

        <span class="pill ${
          o.status==='Delivered'
          ?'green'
          :o.status==='Completed'
          ?'blue'
          :'gold'
        }">

          ${esc(o.status||'New')}

        </span>

      </td>

      <td>
        ${esc(o.deliveryDate||'-')}
      </td>

    </tr>

    `;

  }).join('');

}


/* =========================================================
   REPORT FILTER
   ========================================================= */

function filterReport(){

  const search=
    ($('#reportSearch')?.value||'')
    .trim()
    .toLowerCase();

  const type=
    ($('#reportType')?.value||'');

  const status=
    ($('#reportStatus')?.value||'');

  const from=
    ($('#reportFrom')?.value||'');

  const to=
    ($('#reportTo')?.value||'');


  const filtered=data.orders.filter(o=>{

    const c=customer(o.customerId);

    const searchText=[
      o.orderNo,
      c?.name,
      c?.phone,
      c?.shop,
      o.type,
      o.status
    ]
    .join(' ')
    .toLowerCase();


    if(
      search &&
      !searchText.includes(search)
    )
      return false;


    if(
      type &&
      o.type!==type
    )
      return false;


    if(
      status &&
      o.status!==status
    )
      return false;


    const d=o.orderDate||'';


    if(
      from &&
      d<from
    )
      return false;


    if(
      to &&
      d>to
    )
      return false;


    return true;

  });


  const rows=$('#reportRows');

  if(rows){

    rows.innerHTML=
      reportOrderRows(filtered);

  }

}


/* =========================================================
   CLEAR REPORT FILTER
   ========================================================= */

function clearReportFilter(){

  const ids=[
    'reportSearch',
    'reportType',
    'reportStatus',
    'reportFrom',
    'reportTo'
  ];

  ids.forEach(id=>{

    const el=$('#'+id);

    if(el)
      el.value='';

  });


  const rows=$('#reportRows');

  if(rows)
    rows.innerHTML=
      reportOrderRows(data.orders);

}


/* =========================================================
   DATE-WISE REPORT
   ========================================================= */

function dateWiseReport(){

  const dates={};


  data.orders.forEach(o=>{

    const date=
      o.orderDate ||
      o.startDate ||
      dateNow();


    if(!dates[date]){

      dates[date]={
        orders:0,
        weight:0,
        direct:0,
        sm:0
      };

    }


    dates[date].orders++;

    dates[date].weight +=
      Number(o.weight||0);


    if(o.type==='Direct')
      dates[date].direct++;


    if(o.type==='SM')
      dates[date].sm++;

  });


  const keys=
    Object.keys(dates)
    .sort()
    .reverse();


  if(!keys.length){

    return `
    <tr>

      <td
        colspan="5"
        class="empty">

        No orders available.

      </td>

    </tr>
    `;

  }


  return keys.map(date=>{

    const x=dates[date];

    return `

    <tr>

      <td>
        <b>${esc(date)}</b>
      </td>

      <td>
        ${x.orders}
      </td>

      <td>
        ${x.weight.toFixed(3)} g
      </td>

      <td>
        ${x.direct}
      </td>

      <td>
        ${x.sm}
      </td>

    </tr>

    `;

  }).join('');

}


/* =========================================================
   PRINT REPORT
   ========================================================= */

function printReport(){

  const search=
    ($('#reportSearch')?.value||'')
    .trim()
    .toLowerCase();

  const type=
    ($('#reportType')?.value||'');

  const status=
    ($('#reportStatus')?.value||'');

  const from=
    ($('#reportFrom')?.value||'');

  const to=
    ($('#reportTo')?.value||'');


  const filtered=data.orders.filter(o=>{

    const c=customer(o.customerId);

    const text=[
      o.orderNo,
      c?.name,
      c?.phone,
      c?.shop,
      o.type,
      o.status
    ]
    .join(' ')
    .toLowerCase();


    if(search&&!text.includes(search))
      return false;

    if(type&&o.type!==type)
      return false;

    if(status&&o.status!==status)
      return false;

    const d=o.orderDate||'';

    if(from&&d<from)
      return false;

    if(to&&d>to)
      return false;

    return true;

  });


  const rows=filtered.map(o=>{

    const c=customer(o.customerId);

    return `

    <tr>

      <td>${esc(o.orderNo||'-')}</td>

      <td>${esc(o.orderDate||'-')}</td>

      <td>${esc(c?.name||'-')}</td>

      <td>${esc(o.type||'-')}</td>

      <td>${esc(o.weight||'0')} g</td>

      <td>${esc(o.touch||'-')}</td>

      <td>${money(o.advance)}</td>

      <td>${esc(o.status||'-')}</td>

      <td>${esc(o.deliveryDate||'-')}</td>

    </tr>

    `;

  }).join('');


  const win=
    window.open(
      '',
      '_blank'
    );


  if(!win){

    toast('Please allow pop-ups to print report');

    return;

  }


  win.document.write(`

  <!doctype html>

  <html>

  <head>

    <title>
      SHREE JI CONNECT - Database Report
    </title>

    <style>

      body{
        font-family:Arial,sans-serif;
        padding:30px;
        color:#111;
      }

      h1{
        margin-bottom:5px;
      }

      .sub{
        color:#666;
        margin-bottom:20px;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
      }

      th,td{
        border:1px solid #ccc;
        padding:8px;
        text-align:left;
        font-size:12px;
      }

      th{
        background:#eee;
      }

      .summary{
        display:flex;
        gap:20px;
        margin-top:20px;
      }

      .box{
        border:1px solid #ccc;
        padding:12px;
      }

      @media print{

        body{
          padding:10px;
        }

      }

    </style>

  </head>


  <body>

    <h1>
      SHREE JI GOLD CREATOR LLP
    </h1>

    <div class="sub">
      SHREE JI CONNECT — Database Report
    </div>


    <div class="summary">

      <div class="box">
        <b>Total Orders</b><br>
        ${filtered.length}
      </div>

      <div class="box">
        <b>Total Weight</b><br>
        ${
          filtered.reduce(
            (s,o)=>s+Number(o.weight||0),
            0
          ).toFixed(3)
        } g
      </div>

      <div class="box">
        <b>Direct</b><br>
        ${
          filtered.filter(
            o=>o.type==='Direct'
          ).length
        }
      </div>

      <div class="box">
        <b>SM</b><br>
        ${
          filtered.filter(
            o=>o.type==='SM'
          ).length
        }
      </div>

    </div>


    <table>

      <thead>

        <tr>

          <th>Order No</th>
          <th>Order Date</th>
          <th>Customer</th>
          <th>Type</th>
          <th>Weight</th>
          <th>Touch</th>
          <th>Advance</th>
          <th>Status</th>
          <th>Delivery</th>

        </tr>

      </thead>


      <tbody>

        ${
          rows ||

          `
          <tr>
            <td colspan="9">
              No orders found
            </td>
          </tr>
          `
        }

      </tbody>

    </table>


    <script>

      window.onload=function(){

        window.print();

      };

    <\/script>

  </body>

  </html>

  `);


  win.document.close();

       }




/* =========================================================
   SETTINGS
========================================================= */

function settings(){
  return `
  <div class="page-head">
    <div>
      <div class="eyebrow">Administration</div>
      <div class="title">Settings</div>
      <div class="muted">Company profile, backup and app preferences.</div>
    </div>
  </div>

  <div class="grid two">
    <div class="card">
      <div class="section-title">🏢 Company Profile</div>
      <div class="form-grid">
        <div class="field full"><label>Company Name</label><input class="input" id="companyName" value="SHREE JI GOLD CREATOR LLP"></div>
        <div class="field"><label>App Name</label><input class="input" value="SHREE JI CONNECT" disabled></div>
        <div class="field"><label>Currency</label><input class="input" value="INR (₹)" disabled></div>
      </div>
      <div class="modal-actions">
        <button class="btn primary" onclick="toast('Company branding saved')">Save Profile</button>
      </div>
    </div>

    <div class="card">
      <div class="section-title">💾 Data Backup</div>
      <p class="muted">Export your customer, order, exhibition and review data as a JSON backup.</p>
      <div class="actions">
        <button class="btn primary" onclick="exportData()">Export Backup</button>
        <button class="btn" onclick="importData()">Import Backup</button>
        <button class="btn danger" onclick="resetDemo()">Reset Demo Data</button>
      </div>
    </div>
  </div>

  <div class="footer-note">SHREE JI CONNECT • Built for SHREE JI GOLD CREATOR LLP • Data stored on this device</div>`;
}

/* =========================================================
   COMMON / BACKUP
========================================================= */

function setView(v){
  view=v;
  $('#sidebar').classList.remove('open');
  layout();
}

function openModal(title,html){
  $('#modalTitle').textContent=title;
  $('#modalBody').innerHTML=html;
  $('#modal').classList.remove('hidden');
}

function closeModal(){
  $('#modal').classList.add('hidden');
}

function exportData(){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='shree-ji-connect-backup-'+dateNow()+'.json';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Backup exported');
}

function importData(){
  const i=document.createElement('input');
  i.type='file';
  i.accept='.json';

  i.onchange=()=>{
    const f=i.files[0];
    if(!f) return;

    const r=new FileReader();
    r.onload=()=>{
      try{
        data=JSON.parse(r.result);
        save();
        layout();
        toast('Backup imported');
      }catch{
        toast('Invalid backup file');
      }
    };
    r.readAsText(f);
  };

  i.click();
}

function resetDemo(){
  if(confirm('Reset all app data to demo data?')){
    data=JSON.parse(JSON.stringify(seed));
    save();
    layout();
    toast('Demo data restored');
  }
}

/* =========================================================
   START
========================================================= */

$('#modalClose').onclick=closeModal;

$('#modal').addEventListener('click',e=>{
  if(e.target.id==='modal') closeModal();
});

$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');

document.addEventListener('click',e=>{
  const b=e.target.closest('.nav-item');
  if(b) setView(b.dataset.view);
});

$('#notifyBtn').onclick=()=>toast('No urgent notifications');

layout();
