$(document).ready(function () {
  let cart = [];
  let products = []; // store globally

  // Load products dynamically
  $.getJSON("products.json", function (data) {
    products = data; // save products globally
    renderProducts(data);
  });

  function renderProducts(data) {
    let html = "";
    $.each(data, function (i, product) {
      html += `
          <div class="col-md-4 mb-4 product-card" data-name="${product.name}">
            <div class="card h-100 shadow-sm">
              <img src="${product.image}" class="card-img-top product-img" 
                   alt="${product.name}" 
                   data-name="${product.name}" 
                   data-price="${product.price}" 
                   data-description="${product.description}">
              <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.price}</p>
                <button class="btn btn-primary add-to-cart">Add to Cart</button>
                <button class="btn btn-danger remove-card">Remove</button>
              </div>
            </div>
          </div>`;
    });
    $("#product-list").html(html);
  }

  // Search filter + suggestions
  $("#search-bar").on("keyup", function () {
    let value = $(this).val().toLowerCase();
    let matches = [];

    // Filter visible cards
    $(".product-card").filter(function () {
      let match =
        $(this).find(".card-title").text().toLowerCase().indexOf(value) > -1;
      if (match && value.length > 0) {
        matches.push($(this).find(".card-title").text());
      }
      $(this).toggle(match);
    });

    // Build suggestion list
    let suggestionBox = $("#suggestions");
    suggestionBox.empty();

    if (value.length > 0 && matches.length > 0) {
      matches.forEach((name) => {
        suggestionBox.append(
          `<li class="list-group-item suggestion-item">${name}</li>`
        );
      });
      suggestionBox.show();
    } else {
      suggestionBox.hide();
    }
  });

  // Handle suggestion click
  $(document).on("click", ".suggestion-item", function () {
    let selected = $(this).text();
    $("#search-bar").val(selected);
    $("#suggestions").hide();

    // Trigger filter manually
    $(".product-card").filter(function () {
      $(this).toggle($(this).find(".card-title").text() === selected);
    });
  });

  // Utility to update cart modal
  function updateCart() {
    let cartTable = $("#cart-items");
    cartTable.empty();
    let grandTotal = 0;

    cart.forEach((item, index) => {
      let total = item.priceValue * item.quantity;
      grandTotal += total;

      cartTable.append(`
          <tr>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>
              <button class="btn btn-sm btn-secondary decrease-qty" data-index="${index}">-</button>
              <span class="mx-2">${item.quantity}</span>
              <button class="btn btn-sm btn-secondary increase-qty" data-index="${index}">+</button>
            </td>
            <td>$${total.toFixed(2)}</td>
            <td>
              <button class="btn btn-sm btn-danger remove-from-cart" data-index="${index}">Remove</button>
            </td>
          </tr>
        `);
    });

    $("#grand-total").text(`$${grandTotal.toFixed(2)}`);
    $("#cart-count").text(cart.length);
  }

  // Add to cart (fixed duplicate issue)
  $(document).on("click", ".add-to-cart", function () {
    let card = $(this).closest(".card");
    let name = card.find(".card-title").text();
    let price = card.find(".card-text").text();
    let priceValue = parseFloat(price.replace("$", ""));

    // Check if product already exists in cart
    let existing = cart.find((item) => item.name === name);

    if (existing) {
      // Show toast instead of alert
      let toastEl = new bootstrap.Toast($("#cartToast"));
      $("#cartToast .toast-body").text(
        `${name} is already in the cart. Adjust quantity from cart.`
      );
      toastEl.show();
    } else {
      // Add new entry
      cart.push({ name, price, priceValue, quantity: 1 });
      updateCart();
    }
  });

  // Remove product card from grid + also from cart
  $(document).on("click", ".remove-card", function () {
    let card = $(this).closest(".product-card");
    let name = card.find(".card-title").text();

    // Remove from cart if exists
    cart = cart.filter((item) => item.name !== name);
    updateCart();

    // Remove from UI
    card.fadeOut(500, function () {
      $(this).remove();
    });
  });

  // Open cart modal
  $(document).on("click", ".nav-link:contains('Cart')", function () {
    $("#cartModal").modal("show");
    updateCart();
  });

  // Increase quantity
  $(document).on("click", ".increase-qty", function () {
    let index = $(this).data("index");
    cart[index].quantity++;
    updateCart();
  });

  // Decrease quantity
  $(document).on("click", ".decrease-qty", function () {
    let index = $(this).data("index");
    if (cart[index].quantity > 1) {
      cart[index].quantity--;
    }
    updateCart();
  });

  // Remove from cart
  $(document).on("click", ".remove-from-cart", function () {
    let index = $(this).data("index");
    cart.splice(index, 1);
    updateCart();
  });

  // Modal for product details (same as before)
  $(document).on("click", ".product-img", function () {
    let title = $(this).data("name");
    let price = $(this).data("price");
    let description = $(this).data("description");
    let imgSrc = $(this).attr("src");

    $("#modalTitle").text(title);
    $("#modalPrice").text(price);
    $("#modalDescription").text(description);
    $("#modalImg").attr("src", imgSrc);

    $("#productModal").modal("show");
  });
});
