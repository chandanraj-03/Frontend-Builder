document.addEventListener('DOMContentLoaded', () => {
  // Newsletter Signup
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('[name="email"]').value;
      if (/^\S+@\S+\.\S+$/.test(email)) {
        showSuccess('Newsletter signup successful!', '#newsletter-success');
      } else {
        showError('Invalid email format.', '#newsletter-error');
      }
    });
  }

  // Shipping Address Form
  const shippingForm = document.getElementById('shipping-form');
  if (shippingForm) {
    shippingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const isValid = validateShippingForm(shippingForm);
      if (isValid) {
        showSuccess('Shipping address saved!', '#shipping-success');
        shippingForm.reset();
      } else {
        showError('Please fill all required fields.', '#shipping-error');
      }
    });
  }

  // Pagination
  const paginationItems = document.querySelectorAll('.page-item');
  paginationItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = e.target.closest('a')?.dataset.page;
      if (page) {
        loadPageContent(page);
      }
    });
  });

  // Order Summary
  const itemPriceInputs = document.querySelectorAll('[name="item-price"]');
  itemPriceInputs.forEach(input => {
    input.addEventListener('input', updateOrderSummary);
  });

  // Filter Sidebar
  const filterButtons = document.querySelectorAll('.filter-button');
  filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const filterType = e.target.dataset.filter;
      applyFilter(filterType);
    });
  });

  // Cart Item Quantity
  const quantityInputs = document.querySelectorAll('[name="quantity"]');
  quantityInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const newQty = parseInt(e.target.value, 10);
      if (newQty > 0) {
        e.target.value = newQty;
        updateCartItemPrice(e.target);
      }
    });
  });

  // Product Gallery
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const image = item.querySelector('img');
      if (image) {
        showLightbox(image.src);
      }
    });
  });

  // Name Input (with validation)
  const nameInput = document.querySelector('[name="name"]');
  if (nameInput) {
    nameInput.addEventListener('blur', (e) => {
      const value = e.target.value;
      if (!value || value.length < 3) {
        e.target.setCustomValidity('Name must be at least 3 characters');
      } else {
        e.target.setCustomValidity('');
      }
    });
  }
});

// Helper functions
function showSuccess(message, selector) {
  const container = document.querySelector(selector);
  if (container) {
    container.textContent = message;
    container.style.display = 'block';
    container.classList.add('animate__animated', 'animate__fadeIn');
    setTimeout(() => {
      container.style.display = 'none';
      container.classList.remove('animate__animated', 'animate__fadeIn');
    }, 3000);
  }
}

function showError(message, selector) {
  const container = document.querySelector(selector);
  if (container) {
    container.textContent = message;
    container.style.display = 'block';
    container.classList.add('animate__animated', 'animate__fadeIn');
    setTimeout(() => {
      container.style.display = 'none';
      container.classList.remove('animate__animated', 'animate__fadeIn');
    }, 3000);
  }
}

function validateShippingForm(form) {
  const requiredFields = ['name', 'address', 'city', 'postal'];
  return requiredFields.every(field => {
    const input = form.querySelector(`[name="${field}"]`);
    return input && input.value.trim() !== '';
  });
}

function updateOrderSummary() {
  const total = document.getElementById('total-amount');
  const items = document.querySelectorAll('[name="item-price"]');
  let sum = 0;
  items.forEach(item => {
    sum += parseFloat(item.value) || 0;
  });
  total.textContent = `$${sum.toFixed(2)}`;
}

function applyFilter(filterType) {
  const products = document.querySelectorAll('.product');
  products.forEach(product => {
    if (filterType === 'all' || product.classList.contains(filterType)) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
}

function updateCartItemPrice(input) {
  const price = parseFloat(input.value);
  const priceElement = input.closest('.cart-item').querySelector('.item-price');
  if (priceElement) {
    priceElement.textContent = `$${price.toFixed(2)}`;
  }
}

function loadPageContent(page) {
  // Simulate content loading
  document.getElementById('content').textContent = `Page ${page} loaded`;
  setTimeout(() => {
    document.getElementById('content').textContent = 'Content loaded';
  }, 500);
}

function showLightbox(imageSrc) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <img src="${imageSrc}" alt="Product Image">
    <button class="lightbox-close">&times;</button>
  `;
  document.body.appendChild(lightbox);
  
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
    lightbox.remove();
  });
}