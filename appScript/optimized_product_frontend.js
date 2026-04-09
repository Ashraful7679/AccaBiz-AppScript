// Optimized Product Page JavaScript with Caching and Fast Operations
// Replace the existing Product-js.html content with this optimized version

<script>
  // Global variables
  let allProducts = [];
  let currentPage = 0;
  const PAGE_SIZE = 50;
  let searchTimeout = null;
  let isLoading = false;

  // Local storage cache keys
  const PRODUCTS_CACHE_KEY = 'accabiz_products_cache';
  const PRODUCTS_CACHE_TIMESTAMP = 'accabiz_products_timestamp';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Optimized Product page ready");
    initializeProductPage();
  });

  // Initialize the page
  function initializeProductPage() {
    setupEventListeners();
    loadProductsFromCacheOrServer();
    loadProductStats();
  }

  // Setup event listeners
  function setupEventListeners() {
    // Search functionality with debouncing
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          performSearch(e.target.value);
        }, 300); // 300ms debounce
      });
    }

    // Pagination buttons
    document.getElementById('prevPage')?.addEventListener('click', () => changePage(currentPage - 1));
    document.getElementById('nextPage')?.addEventListener('click', () => changePage(currentPage + 1));

    // Page size selector
    document.getElementById('pageSize')?.addEventListener('change', function(e) {
      PAGE_SIZE = parseInt(e.target.value);
      currentPage = 0;
      loadProductsFromCacheOrServer();
    });
  }

  // Load products from cache or server
  function loadProductsFromCacheOrServer() {
    if (isLoading) return;

    const cachedData = getCachedProducts();
    if (cachedData && !isCacheExpired()) {
      console.log('📦 Using cached product data');
      allProducts = cachedData;
      renderProductTable(allProducts.slice(0, PAGE_SIZE));
      updatePaginationInfo({ total: allProducts.length, page: 0, pageSize: PAGE_SIZE });
      return;
    }

    // Load from server
    loadProductsFromServer();
  }

  // Load products from server with pagination
  function loadProductsFromServer(page = 0, searchTerm = '') {
    if (isLoading) return;

    isLoading = true;
    showLoadingState();

    const usePagination = searchTerm ? false : true; // Use pagination for full data, search for filtered

    if (usePagination) {
      google.script.run
        .withSuccessHandler(function(result) {
          handleServerResponse(result, page);
        })
        .withFailureHandler(handleError)
        .getProductDataPaginated(page, PAGE_SIZE, searchTerm);
    } else {
      // For search, use the search function
      google.script.run
        .withSuccessHandler(function(data) {
          allProducts = data;
          renderProductTable(data);
          updatePaginationInfo({ total: data.length, page: 0, pageSize: data.length });
          hideLoadingState();
          isLoading = false;
        })
        .withFailureHandler(handleError)
        .searchProducts(searchTerm, 100); // Limit search results
    }
  }

  // Handle server response
  function handleServerResponse(result, requestedPage) {
    if (result.error) {
      handleError(result.error);
      return;
    }

    if (requestedPage === 0 && !result.searchTerm) {
      // Cache full dataset on first page load
      allProducts = result.data;
      cacheProducts(result.data);
    }

    renderProductTable(result.data);
    updatePaginationInfo(result);
    hideLoadingState();
    isLoading = false;
  }

  // Perform search
  function performSearch(searchTerm) {
    if (!searchTerm.trim()) {
      // Reset to full data
      currentPage = 0;
      loadProductsFromCacheOrServer();
      return;
    }

    // Use cached data for instant search if available
    if (allProducts.length > 0) {
      const filtered = allProducts.filter(product =>
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      renderProductTable(filtered.slice(0, PAGE_SIZE));
      updatePaginationInfo({ total: filtered.length, page: 0, pageSize: PAGE_SIZE });
      return;
    }

    // Fallback to server search
    loadProductsFromServer(0, searchTerm);
  }

  // Change page
  function changePage(newPage) {
    if (newPage < 0) return;

    currentPage = newPage;

    if (allProducts.length > 0) {
      // Use cached data for pagination
      const startIndex = newPage * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const pageData = allProducts.slice(startIndex, endIndex);

      if (pageData.length > 0) {
        renderProductTable(pageData);
        updatePaginationInfo({
          total: allProducts.length,
          page: newPage,
          pageSize: PAGE_SIZE,
          hasNext: endIndex < allProducts.length,
          hasPrev: newPage > 0
        });
        return;
      }
    }

    // Load from server if not in cache
    loadProductsFromServer(newPage);
  }

  // Render product table
  function renderProductTable(data) {
    const tbody = document.getElementById('product-list-body');
    const rowCount = document.getElementById('rowCount');

    if (!data || data.length === 0) {
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#95a5a6;">No products found.</td></tr>';
      }
      if (rowCount) rowCount.innerText = '0';
      return;
    }

    if (rowCount) rowCount.innerText = data.length;

    const html = data.map(item => {
      const activeStatus = String(item.isActive).toUpperCase() === "TRUE";
      const statusClass = activeStatus ? 'active-status' : 'inactive-status';
      const statusText = activeStatus ? 'Active' : 'Inactive';

      const descriptionText = item.description
        ? `<div style="font-size:0.75rem; color:#7f8c8d; line-height: 1.2; margin-top:3px;">${item.description}</div>`
        : '';

      const types = item.type ? item.type.split(', ') : [];
      const typeBadges = types.map(t =>
        `<span class="type-badge">${t.trim()}</span>`
      ).join('');

      return `
        <tr>
          <td>
            <div style="font-weight:600; color:#2c3e50;">${item.name || 'N/A'}</div>
            <div style="font-size:0.75rem; color:#7f8c8d;">${item.code || ''}</div>
            ${descriptionText}
          </td>
          <td>
            <div style="font-weight:600;">${item.currency || 'USD'} ${parseFloat(item.unitPrice || 0).toFixed(2)}</div>
          </td>
          <td>
            <div style="font-weight:600;">${item.stockAmount || 0}</div>
          </td>
          <td>${typeBadges}</td>
          <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-action" style="color: #3498db;" onclick="editProduct('${item.id}')" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-action" style="color: #e74c3c;" onclick="deleteProduct('${item.id}')" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (tbody) tbody.innerHTML = html;
  }

  // Update pagination info
  function updatePaginationInfo(info) {
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (pageInfo) {
      const start = info.page * info.pageSize + 1;
      const end = Math.min((info.page + 1) * info.pageSize, info.total);
      pageInfo.textContent = `Showing ${start}-${end} of ${info.total} products`;
    }

    if (prevBtn) prevBtn.disabled = !info.hasPrev;
    if (nextBtn) nextBtn.disabled = !info.hasNext;
  }

  // Cache management functions
  function cacheProducts(data) {
    try {
      localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(PRODUCTS_CACHE_TIMESTAMP, Date.now().toString());
      console.log('💾 Products cached locally');
    } catch (e) {
      console.warn('Failed to cache products:', e);
    }
  }

  function getCachedProducts() {
    try {
      const data = localStorage.getItem(PRODUCTS_CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to get cached products:', e);
      return null;
    }
  }

  function isCacheExpired() {
    try {
      const timestamp = localStorage.getItem(PRODUCTS_CACHE_TIMESTAMP);
      if (!timestamp) return true;
      return (Date.now() - parseInt(timestamp)) > CACHE_DURATION;
    } catch (e) {
      return true;
    }
  }

  function clearProductCache() {
    try {
      localStorage.removeItem(PRODUCTS_CACHE_KEY);
      localStorage.removeItem(PRODUCTS_CACHE_TIMESTAMP);
      console.log('🗑️ Product cache cleared');
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  }

  // Optimized save product function
  function saveProduct(formData) {
    showLoadingState();

    google.script.run
      .withSuccessHandler(function(result) {
        showNotification(result, 'success');
        clearProductCache(); // Clear cache to force refresh
        loadProductsFromCacheOrServer();
        closeProductModal();
        loadProductStats(); // Refresh stats
        hideLoadingState();
      })
      .withFailureHandler(function(error) {
        showNotification('Error saving product: ' + error, 'error');
        hideLoadingState();
      })
      .saveProductOptimized(formData);
  }

  // Batch save multiple products
  function saveProductsBatch(products) {
    showLoadingState();

    google.script.run
      .withSuccessHandler(function(result) {
        showNotification(result.message, result.success ? 'success' : 'error');
        if (result.success) {
          clearProductCache();
          loadProductsFromCacheOrServer();
          loadProductStats();
        }
        hideLoadingState();
      })
      .withFailureHandler(function(error) {
        showNotification('Batch save error: ' + error, 'error');
        hideLoadingState();
      })
      .saveProductsBatch(products);
  }

  // Load product statistics
  function loadProductStats() {
    google.script.run
      .withSuccessHandler(function(stats) {
        updateStatsDisplay(stats);
      })
      .withFailureHandler(function(error) {
        console.error('Stats error:', error);
      })
      .getProductStats();
  }

  // Update statistics display
  function updateStatsDisplay(stats) {
    const statsContainer = document.getElementById('productStats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-number">${stats.total}</div>
        <div class="stat-label">Total Products</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.active}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.lowStock}</div>
        <div class="stat-label">Low Stock</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.currency || 'USD'} ${stats.totalValue.toFixed(2)}</div>
        <div class="stat-label">Total Value</div>
      </div>
    `;
  }

  // UI helper functions
  function showLoadingState() {
    const tbody = document.getElementById('product-list-body');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    }
  }

  function hideLoadingState() {
    // Loading state is cleared when data is rendered
  }

  function handleError(error) {
    console.error('Product operation error:', error);
    const tbody = document.getElementById('product-list-body');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Error: ${error}</td></tr>`;
    }
    hideLoadingState();
    isLoading = false;
  }

  // Enhanced search with local filtering
  function instantSearch(searchTerm) {
    if (!allProducts.length) return;

    const term = searchTerm.toLowerCase();
    const filtered = allProducts.filter(product =>
      (product.name && product.name.toLowerCase().includes(term)) ||
      (product.description && product.description.toLowerCase().includes(term)) ||
      (product.code && product.code.toLowerCase().includes(term)) ||
      (product.type && product.type.toLowerCase().includes(term))
    );

    renderProductTable(filtered.slice(0, PAGE_SIZE));
    updatePaginationInfo({ total: filtered.length, page: 0, pageSize: PAGE_SIZE });
  }

  // Export functions (for bulk operations)
  function exportProducts() {
    if (!allProducts.length) {
      showNotification('No products to export', 'warning');
      return;
    }

    const csvContent = convertToCSV(allProducts);
    downloadCSV(csvContent, 'products_export.csv');
  }

  function convertToCSV(data) {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\\n');
  }

  function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Performance monitoring
  function logPerformance(operation, startTime) {
    const duration = Date.now() - startTime;
    console.log(`⚡ ${operation} completed in ${duration}ms`);
  }

  // Initialize performance monitoring
  const originalLoadProducts = loadProductsFromServer;
  loadProductsFromServer = function() {
    const startTime = Date.now();
    const result = originalLoadProducts.apply(this, arguments);
    // Note: This won't work perfectly with async functions, but good for logging
    return result;
  };

  console.log("🚀 Optimized Product functions loaded!");
</script>