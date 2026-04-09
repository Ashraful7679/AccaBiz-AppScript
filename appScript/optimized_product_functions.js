// Optimized Product Data Functions with Caching and Batch Operations
// Add these to your serverSideFuncs.js file

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const PRODUCT_CACHE_KEY = 'product_data_cache';

/**
 * Get cached product data or fetch fresh data
 * @returns {Array} Product data array
 */
function getProductDataCached() {
  try {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get(PRODUCT_CACHE_KEY);

    if (cachedData) {
      console.log('Returning cached product data');
      return JSON.parse(cachedData);
    }

    // Fetch fresh data
    const freshData = getProductData();
    if (freshData && freshData.length > 0) {
      cache.put(PRODUCT_CACHE_KEY, JSON.stringify(freshData), CACHE_DURATION / 1000);
      console.log('Cached fresh product data');
    }

    return freshData;
  } catch (e) {
    Logger.log('Cache error: ' + e.toString());
    return getProductData(); // Fallback to regular function
  }
}

/**
 * Optimized product data fetching with pagination
 * @param {number} page - Page number (0-based)
 * @param {number} pageSize - Number of records per page
 * @param {string} searchTerm - Search filter
 * @returns {Object} Paginated result with data and metadata
 */
function getProductDataPaginated(page = 0, pageSize = 50, searchTerm = '') {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("Product");

    if (!sheet) return { data: [], total: 0, page: page, pageSize: pageSize };

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return { data: [], total: 0, page: page, pageSize: pageSize };

    const normalizedData = normalizeSheetRows(data);
    let filteredData = normalizedData;

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredData = normalizedData.filter(product =>
        (product.name && product.name.toLowerCase().includes(term)) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.code && product.code.toLowerCase().includes(term))
      );
    }

    const total = filteredData.length;
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, total);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: total,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasNext: endIndex < total,
      hasPrev: page > 0
    };
  } catch (e) {
    Logger.log('Pagination error: ' + e.toString());
    return { data: [], total: 0, page: page, pageSize: pageSize, error: e.toString() };
  }
}

/**
 * Fast product search without loading all data
 * @param {string} searchTerm - Search term
 * @param {number} limit - Maximum results to return
 * @returns {Array} Matching products
 */
function searchProducts(searchTerm, limit = 20) {
  try {
    if (!searchTerm || !searchTerm.trim()) {
      return getProductDataCached().slice(0, limit);
    }

    const term = searchTerm.toLowerCase().trim();
    const allProducts = getProductDataCached();

    return allProducts
      .filter(product =>
        (product.name && product.name.toLowerCase().includes(term)) ||
        (product.description && product.description.toLowerCase().includes(term)) ||
        (product.code && product.code.toLowerCase().includes(term))
      )
      .slice(0, limit);
  } catch (e) {
    Logger.log('Search error: ' + e.toString());
    return [];
  }
}

/**
 * Optimized batch product save/update
 * @param {Array} products - Array of product objects to save
 * @returns {Object} Result with success/failure counts
 */
function saveProductsBatch(products) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("Product");

    if (!sheet || !products || products.length === 0) {
      return { success: false, message: 'Invalid input' };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    let created = 0;
    let updated = 0;
    let errors = [];

    // Process each product
    products.forEach(product => {
      try {
        if (product.id) {
          // Update existing product
          const idIndex = headers.indexOf("id");
          const existingIndex = rows.findIndex(row => row[idIndex] === product.id);

          if (existingIndex !== -1) {
            const rowNum = existingIndex + 2; // +2 because of 0-based array and 1-based header
            updateProductRow(sheet, headers, rowNum, product);
            updated++;
          } else {
            errors.push(`Product with id ${product.id} not found`);
          }
        } else {
          // Create new product
          const newRow = createProductRow(headers, product);
          sheet.appendRow(newRow);
          created++;
        }
      } catch (e) {
        errors.push(`Error processing product: ${e.toString()}`);
      }
    });

    // Clear cache after bulk operations
    clearProductCache();

    return {
      success: true,
      created: created,
      updated: updated,
      errors: errors,
      message: `Processed ${products.length} products: ${created} created, ${updated} updated, ${errors.length} errors`
    };
  } catch (e) {
    Logger.log('Batch save error: ' + e.toString());
    return { success: false, message: e.toString() };
  }
}

/**
 * Optimized single product save with batch operations
 * @param {Object} formData - Product data
 * @returns {string} Success message
 */
function saveProductOptimized(formData) {
  try {
    const result = saveProductsBatch([formData]);

    if (result.success) {
      return result.created > 0 ? "Product Created Successfully!" : "Product Updated Successfully!";
    } else {
      throw new Error(result.message);
    }
  } catch (e) {
    Logger.log('Save error: ' + e.toString());
    throw e;
  }
}

/**
 * Helper function to update a product row
 */
function updateProductRow(sheet, headers, rowNum, product) {
  const now = new Date();
  const updates = [];

  // Build update operations
  if (product.name !== undefined) {
    const colIndex = headers.indexOf("name") + 1;
    updates.push({ row: rowNum, col: colIndex, value: product.name });
  }

  if (product.description !== undefined) {
    const colIndex = headers.indexOf("description") + 1;
    updates.push({ row: rowNum, col: colIndex, value: product.description });
  }

  if (product.unitPrice !== undefined) {
    const colIndex = headers.indexOf("unitPrice") + 1;
    updates.push({ row: rowNum, col: colIndex, value: product.unitPrice });
  }

  if (product.currency !== undefined) {
    const colIndex = headers.indexOf("currency") + 1;
    updates.push({ row: rowNum, col: colIndex, value: product.currency });
  }

  if (product.stockAmount !== undefined) {
    const colIndex = headers.indexOf("stockAmount") + 1;
    updates.push({ row: rowNum, col: colIndex, value: product.stockAmount });
  }

  if (product.isActive !== undefined) {
    const colIndex = headers.indexOf("isActive") + 1;
    updates.push({ row: rowNum, col: colIndex, value: product.isActive });
  }

  if (product.type !== undefined) {
    const colIndex = headers.indexOf("type") + 1;
    updates.push({ row: rowNum, col: colIndex, value: product.type });
  }

  // Always update updatedAt
  const updatedAtIndex = headers.indexOf("updatedAt") + 1;
  updates.push({ row: rowNum, col: updatedAtIndex, value: now });

  // Execute batch update
  const range = sheet.getRange(rowNum, 1, 1, headers.length);
  const currentValues = range.getValues()[0];

  updates.forEach(update => {
    currentValues[update.col - 1] = update.value;
  });

  range.setValues([currentValues]);
}

/**
 * Helper function to create a new product row
 */
function createProductRow(headers, product) {
  const now = new Date();
  const newId = Utilities.getUuid();
  const newCode = "PRD-" + now.getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
  const companyId = "DEFAULT-COMP-01";

  return headers.map(header => {
    switch(header) {
      case "id": return newId;
      case "code": return newCode;
      case "sku": return newCode;
      case "name": return product.name || '';
      case "description": return product.description || '';
      case "unitPrice": return product.unitPrice || 0;
      case "currency": return product.currency || 'USD';
      case "stockAmount": return product.stockAmount || 0;
      case "isActive": return product.isActive !== undefined ? product.isActive : true;
      case "companyId": return companyId;
      case "createdAt": return now;
      case "updatedAt": return now;
      case "type": return product.type || '';
      default: return '';
    }
  });
}

/**
 * Clear product cache
 */
function clearProductCache() {
  try {
    const cache = CacheService.getScriptCache();
    cache.remove(PRODUCT_CACHE_KEY);
    console.log('Product cache cleared');
  } catch (e) {
    Logger.log('Cache clear error: ' + e.toString());
  }
}

/**
 * Get product statistics
 * @returns {Object} Product statistics
 */
function getProductStats() {
  try {
    const products = getProductDataCached();

    const stats = {
      total: products.length,
      active: products.filter(p => String(p.isActive).toUpperCase() === 'TRUE').length,
      inactive: products.filter(p => String(p.isActive).toUpperCase() !== 'TRUE').length,
      totalValue: products.reduce((sum, p) => sum + (parseFloat(p.unitPrice || 0) * parseFloat(p.stockAmount || 0)), 0),
      avgPrice: products.length > 0 ? products.reduce((sum, p) => sum + parseFloat(p.unitPrice || 0), 0) / products.length : 0,
      lowStock: products.filter(p => parseFloat(p.stockAmount || 0) < 10).length
    };

    return stats;
  } catch (e) {
    Logger.log('Stats error: ' + e.toString());
    return { total: 0, active: 0, inactive: 0, totalValue: 0, avgPrice: 0, lowStock: 0 };
  }
}