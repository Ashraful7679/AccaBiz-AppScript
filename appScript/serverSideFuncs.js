function getProductData() {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("Product"); 
    
    if (!sheet) return []; // শিট না পাওয়া গেলে খালি অ্যারে দিবে

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return []; // শুধু হেডার থাকলে বা ডাটা না থাকলে

    return normalizeSheetRows(data);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function normalizeSheetRows(data) {
  const headers = data[0].map(h => h.toString().trim());
  const rows = data.slice(1);
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      const value = row[i];
      obj[header] = value;
      const lower = header.toLowerCase();
      if (lower !== header) {
        obj[lower] = value;
      }
    });
    return obj;
  });
}

function getAllSheetNames() {
  const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
  return ss.getSheets().map(sheet => sheet.getName());
}

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  const data = sheet.getDataRange().getDisplayValues();
  if (data.length < 2) return [];
  return normalizeSheetRows(data);
}

function getSheetRowCount(sheetName) {
  const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return 0;
  return Math.max(0, sheet.getDataRange().getNumRows() - 1);
}

function testLogger() {
  const result = getProductData();
  
  // চেক করুন ডাটা পাওয়া গেছে কি না
  if (result.length === 0) {
    console.log("⚠️ কোনো ডাটা পাওয়া যায়নি! শিট নেম বা কলাম চেক করুন।");
  } else {
    console.log("✅ সফলভাবে ডাটা পাওয়া গেছে!");
    console.log("প্রথম রো-এর ডাটা নমুনা:", JSON.stringify(result[0], null, 2));
    console.log("মোট প্রোডাক্ট সংখ্যা:", result.length);
  }
}

function saveProduct(formData) {
  const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
  const sheet = ss.getSheetByName("Product");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const idIndex = headers.indexOf("id");
  const now = new Date();
  
  if (formData.id) {
    // এডিট মোড (Update)
    const rows = data.slice(1);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idIndex] === formData.id) {
        const rowNum = i + 2;
        sheet.getRange(rowNum, headers.indexOf("name") + 1).setValue(formData.name);
        sheet.getRange(rowNum, headers.indexOf("description") + 1).setValue(formData.description);
        sheet.getRange(rowNum, headers.indexOf("unitPrice") + 1).setValue(formData.unitPrice);
        sheet.getRange(rowNum, headers.indexOf("currency") + 1).setValue(formData.currency);
        sheet.getRange(rowNum, headers.indexOf("stockAmount") + 1).setValue(formData.stockAmount);
        sheet.getRange(rowNum, headers.indexOf("isActive") + 1).setValue(formData.isActive);
        sheet.getRange(rowNum, headers.indexOf("updatedAt") + 1).setValue(now);
        sheet.getRange(rowNum, headers.indexOf("type") + 1).setValue(formData.type);
        return "Product Updated Successfully!";
      }
    }
  } else {
    // নতুন প্রোডাক্ট (Create)
    const newId = Utilities.getUuid();
    const newCode = "PRD-" + now.getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const companyId = "DEFAULT-COMP-01"; // আপনি চাইলে এটি ডাইনামিক করতে পারেন
    
    const newRow = headers.map(header => {
      switch(header) {
        case "id": return newId;
        case "code": return newCode;
        case "sku": return newCode;
        case "name": return formData.name;
        case "description": return formData.description;
        case "unitPrice": return formData.unitPrice;
        case "currency": return formData.currency;
        case "stockAmount": return formData.stockAmount;
        case "isActive": return formData.isActive;
        case "companyId": return companyId;
        case "createdAt": return now;
        case "updatedAt": return now;
        case "type": return formData.type;
        default: return "";
      }
    });
    sheet.appendRow(newRow);
    return "Product Added Successfully!";
  }
}

function getVendorData() {
  // Backward compatibility - calls getSupplierData
  return getSupplierData();
}

function getSupplierData() {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("Supplier"); 
    
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    return normalizeSheetRows(data);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function saveVendor(formData) {
  return saveSupplier(formData);
}

function saveSupplier(formData) {
  const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
  const sheet = ss.getSheetByName("Supplier");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const idIndex = headers.indexOf("id");
  const now = new Date();
  
  if (formData.id) {
    // Edit mode
    const rows = data.slice(1);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idIndex] === formData.id) {
        const rowNum = i + 2;
        sheet.getRange(rowNum, headers.indexOf("name") + 1).setValue(formData.name);
        sheet.getRange(rowNum, headers.indexOf("email") + 1).setValue(formData.email);
        sheet.getRange(rowNum, headers.indexOf("phone") + 1).setValue(formData.phone);
        sheet.getRange(rowNum, headers.indexOf("address") + 1).setValue(formData.address);
        sheet.getRange(rowNum, headers.indexOf("city") + 1).setValue(formData.city);
        sheet.getRange(rowNum, headers.indexOf("country") + 1).setValue(formData.country);
        sheet.getRange(rowNum, headers.indexOf("tinVat") + 1).setValue(formData.tinVat);
        sheet.getRange(rowNum, headers.indexOf("isActive") + 1).setValue(formData.isActive);
        sheet.getRange(rowNum, headers.indexOf("contactPerson") + 1).setValue(formData.contactPerson);
        sheet.getRange(rowNum, headers.indexOf("openingBalance") + 1).setValue(formData.openingBalance);
        sheet.getRange(rowNum, headers.indexOf("preferredCurrency") + 1).setValue(formData.preferredCurrency);
        sheet.getRange(rowNum, headers.indexOf("productIds") + 1).setValue(formData.productIds);
        sheet.getRange(rowNum, headers.indexOf("updatedAt") + 1).setValue(now);
        return "Vendor Updated Successfully!";
      }
    }
  } else {
    // New vendor
    const newId = Utilities.getUuid();
    const newCode = "VEN-" + now.getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const companyId = "DEFAULT-COMP-01";
    
    const newRow = headers.map(header => {
      switch(header) {
        case "id": return newId;
        case "code": return newCode;
        case "name": return formData.name;
        case "companyId": return companyId;
        case "email": return formData.email;
        case "phone": return formData.phone;
        case "address": return formData.address;
        case "city": return formData.city;
        case "country": return formData.country;
        case "tinVat": return formData.tinVat;
        case "isActive": return formData.isActive;
        case "createdAt": return now;
        case "updatedAt": return now;
        case "contactPerson": return formData.contactPerson;
        case "openingBalance": return formData.openingBalance;
        case "preferredCurrency": return formData.preferredCurrency;
        case "productIds": return formData.productIds;
        default: return "";
      }
    });
    sheet.appendRow(newRow);
    return "Vendor Added Successfully!";
  }
}

function getProductsByTag(tag) {
  const products = getProductData();
  const normalizedTag = (tag || '').toString().trim().toLowerCase();
  if (!normalizedTag) return [];

  return products.filter(item => {
    // Check column M (index 12) directly, as user specified type is in column M
    const typeValue = (item[12] || item.type || item.Type || item["type"] || item["Type"] || '').toString().trim().toLowerCase();
    const values = typeValue.split(/[,;\s]+/).map(v => v.trim()).filter(Boolean);
    return values.includes(normalizedTag);
  });
}

function getCustomerData() {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("Customer");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    return normalizeSheetRows(data);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function saveCustomer(formData) {
  const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
  const sheet = ss.getSheetByName("Customer");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf("id");
  const now = new Date();

  if (formData.id) {
    const rows = data.slice(1);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idIndex] === formData.id) {
        const rowNum = i + 2;
        sheet.getRange(rowNum, headers.indexOf("name") + 1).setValue(formData.name);
        sheet.getRange(rowNum, headers.indexOf("email") + 1).setValue(formData.email);
        sheet.getRange(rowNum, headers.indexOf("phone") + 1).setValue(formData.phone);
        sheet.getRange(rowNum, headers.indexOf("address") + 1).setValue(formData.address);
        sheet.getRange(rowNum, headers.indexOf("city") + 1).setValue(formData.city);
        sheet.getRange(rowNum, headers.indexOf("country") + 1).setValue(formData.country);
        sheet.getRange(rowNum, headers.indexOf("tinVat") + 1).setValue(formData.tinVat);
        sheet.getRange(rowNum, headers.indexOf("isActive") + 1).setValue(formData.isActive);
        sheet.getRange(rowNum, headers.indexOf("contactPerson") + 1).setValue(formData.contactPerson);
        sheet.getRange(rowNum, headers.indexOf("openingBalance") + 1).setValue(formData.openingBalance);
        sheet.getRange(rowNum, headers.indexOf("preferredCurrency") + 1).setValue(formData.preferredCurrency);
        sheet.getRange(rowNum, headers.indexOf("productIds") + 1).setValue(formData.productIds);
        sheet.getRange(rowNum, headers.indexOf("updatedAt") + 1).setValue(now);
        return "Customer Updated Successfully!";
      }
    }
  } else {
    const newId = Utilities.getUuid();
    const newCode = "CUS-" + now.getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const companyId = "DEFAULT-COMP-01";
    const newRow = headers.map(header => {
      switch (header) {
        case "id": return newId;
        case "code": return newCode;
        case "name": return formData.name;
        case "companyId": return companyId;
        case "email": return formData.email;
        case "phone": return formData.phone;
        case "address": return formData.address;
        case "city": return formData.city;
        case "country": return formData.country;
        case "tinVat": return formData.tinVat;
        case "isActive": return formData.isActive;
        case "createdAt": return now;
        case "updatedAt": return now;
        case "contactPerson": return formData.contactPerson;
        case "openingBalance": return formData.openingBalance;
        case "preferredCurrency": return formData.preferredCurrency;
        case "productIds": return formData.productIds;
        default: return "";
      }
    });
    sheet.appendRow(newRow);
    return "Customer Added Successfully!";
  }
}

// ============ PURCHASE ORDER FUNCTIONS ============

function getPurchaseOrderData() {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("PurchaseOrder");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    return normalizeSheetRows(data);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function getPurchaseOrderLinesByPO(poId) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("PurchaseOrderLine");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    const lines = normalizeSheetRows(data);
    return lines.filter(line => line.purchaseOrderId === poId);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function savePurchaseOrder(formData) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const poSheet = ss.getSheetByName("PurchaseOrder");
    const poLineSheet = ss.getSheetByName("PurchaseOrderLine");
    
    if (!poSheet || !poLineSheet) return "Error: Required sheets not found";

    const poData = poSheet.getDataRange().getValues();
    const poHeaders = poData[0];
    const now = new Date();
    let poId = formData.id;

    // Create or Update PO
    if (!poId) {
      // New PO
      poId = Utilities.getUuid();
      const poNumber = "PO-" + now.getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
      const companyId = "DEFAULT-COMP-01";
      
      const newPORow = poHeaders.map(header => {
        switch(header) {
          case "id": return poId;
          case "poNumber": return poNumber;
          case "companyId": return companyId;
          case "supplierId": return formData.supplierId;
          case "poDate": return formData.poDate;
          case "expectedFinalReceivingDate": return formData.expectedFinalReceivingDate;
          case "currency": return formData.currency;
          case "totalAmount": return formData.totalAmount;
          case "status": return formData.status || "Pending";
          case "createdById": return "USER-01";
          case "createdAt": return now;
          case "updatedAt": return now;
          default: return "";
        }
      });
      poSheet.appendRow(newPORow);
    } else {
      // Update existing PO
      const rows = poData.slice(1);
      const idIndex = poHeaders.indexOf("id");
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][idIndex] === poId) {
          const rowNum = i + 2;
          const supplierId = poHeaders.indexOf("supplierId");
          const poDate = poHeaders.indexOf("poDate");
          const expectedDelivery = poHeaders.indexOf("expectedFinalReceivingDate");
          const currency = poHeaders.indexOf("currency");
          const totalAmount = poHeaders.indexOf("totalAmount");
          const status = poHeaders.indexOf("status");
          const updatedAt = poHeaders.indexOf("updatedAt");
          
          if (supplierId !== -1) poSheet.getRange(rowNum, supplierId + 1).setValue(formData.supplierId);
          if (poDate !== -1) poSheet.getRange(rowNum, poDate + 1).setValue(formData.poDate);
          if (expectedDelivery !== -1) poSheet.getRange(rowNum, expectedDelivery + 1).setValue(formData.expectedFinalReceivingDate);
          if (currency !== -1) poSheet.getRange(rowNum, currency + 1).setValue(formData.currency);
          if (totalAmount !== -1) poSheet.getRange(rowNum, totalAmount + 1).setValue(formData.totalAmount);
          if (status !== -1) poSheet.getRange(rowNum, status + 1).setValue(formData.status);
          if (updatedAt !== -1) poSheet.getRange(rowNum, updatedAt + 1).setValue(now);
          break;
        }
      }
    }

    // Delete existing line items for this PO
    const poLineData = poLineSheet.getDataRange().getValues();
    const poLineHeaders = poLineData[0];
    const poIdIndex = poLineHeaders.indexOf("purchaseOrderId");
    
    // Delete rows in reverse order to avoid index shifting
    for (let i = poLineData.length - 1; i >= 1; i--) {
      if (poLineData[i][poIdIndex] === poId) {
        poLineSheet.deleteRow(i + 1);
      }
    }

    // Add new line items
    if (formData.lineItems && formData.lineItems.length > 0) {
      formData.lineItems.forEach(item => {
        const newLineRow = poLineHeaders.map(header => {
          const lineId = Utilities.getUuid();
          switch(header) {
            case "id": return item.id && !item.id.startsWith('line-') ? item.id : lineId;
            case "purchaseOrderId": return poId;
            case "itemDescription": return item.itemDescription;
            case "quantity": return item.quantity;
            case "currency +\nunitPrice": return item.currency + " " + item.unitPrice;
            case "currency + unitPrice": return item.currency + " " + item.unitPrice;
            case "total": return item.total;
            case "productId": return item.productId;
            case "expectedReceivingDate": return item.expectedReceivingDate;
            default: return "";
          }
        });
        poLineSheet.appendRow(newLineRow);
      });
    }

    return "Purchase Order saved successfully!";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

function deletePurchaseOrder(poId) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const poSheet = ss.getSheetByName("PurchaseOrder");
    const poLineSheet = ss.getSheetByName("PurchaseOrderLine");
    
    if (!poSheet || !poLineSheet) return "Error: Required sheets not found";

    // Delete PO
    const poData = poSheet.getDataRange().getValues();
    const poHeaders = poData[0];
    const idIndex = poHeaders.indexOf("id");

    for (let i = poData.length - 1; i >= 1; i--) {
      if (poData[i][idIndex] === poId) {
        poSheet.deleteRow(i + 1);
        break;
      }
    }

    // Delete PO line items
    const poLineData = poLineSheet.getDataRange().getValues();
    const poLineHeaders = poLineData[0];
    const poIdIndex = poLineHeaders.indexOf("purchaseOrderId");

    for (let i = poLineData.length - 1; i >= 1; i--) {
      if (poLineData[i][poIdIndex] === poId) {
        poLineSheet.deleteRow(i + 1);
      }
    }

    return "Purchase Order deleted successfully!";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

function updatePurchaseOrderStatus(poId, newStatus) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const poSheet = ss.getSheetByName("PurchaseOrder");
    
    if (!poSheet) return "Error: PurchaseOrder sheet not found";

    const poData = poSheet.getDataRange().getValues();
    const poHeaders = poData[0];
    const idIndex = poHeaders.indexOf("id");
    const statusIndex = poHeaders.indexOf("status");

    const rows = poData.slice(1);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idIndex] === poId) {
        const rowNum = i + 2;
        if (statusIndex !== -1) {
          poSheet.getRange(rowNum, statusIndex + 1).setValue(newStatus);
        }
        return "Status updated successfully";
      }
    }

    return "Purchase Order not found";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

// ============ PURCHASE INVOICE FUNCTIONS ============

function getPurchaseInvoiceData() {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("PurchaseInvoice");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    return normalizeSheetRows(data);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function getPurchaseInvoiceLinesByPI(piId) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("PurchaseInvoiceLine");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    const lines = normalizeSheetRows(data);
    return lines.filter(line => line.purchaseInvoiceId === piId);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function savePurchaseInvoice(formData) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const piSheet = ss.getSheetByName("PurchaseInvoice");
    const piLineSheet = ss.getSheetByName("PurchaseInvoiceLine");
    
    if (!piSheet || !piLineSheet) return "Error: Required sheets not found";

    const piData = piSheet.getDataRange().getValues();
    const piHeaders = piData[0];
    const now = new Date();
    let piId = formData.id;

    if (!piId) {
      piId = Utilities.getUuid();
      const piNumber = "PI-" + now.getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
      const companyId = "DEFAULT-COMP-01";
      
      const newPIRow = piHeaders.map(header => {
        switch(header) {
          case "id": return piId;
          case "purchaseInvoiceNumber": return piNumber;
          case "companyId": return companyId;
          case "supplierId": return formData.supplierId;
          case "purchaseOrderId": return formData.purchaseOrderId;
          case "expectedFinalReceivingDate": return formData.expectedFinalReceivingDate;
          case "currency": return formData.currency;
          case "totalForeign": return formData.totalAmount;
          case "status": return formData.status || "Pending";
          case "createdById": return "USER-01";
          case "createdAt": return now;
          case "updatedAt": return now;
          default: return "";
        }
      });
      piSheet.appendRow(newPIRow);
    } else {
      const rows = piData.slice(1);
      const idIndex = piHeaders.indexOf("id");
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][idIndex] === piId) {
          const rowNum = i + 2;
          const statusIndex = piHeaders.indexOf("status");
          const totalIndex = piHeaders.indexOf("totalForeign");
          const updatedAtIndex = piHeaders.indexOf("updatedAt");
          
          if (statusIndex !== -1) piSheet.getRange(rowNum, statusIndex + 1).setValue(formData.status);
          if (totalIndex !== -1) piSheet.getRange(rowNum, totalIndex + 1).setValue(formData.totalAmount);
          if (updatedAtIndex !== -1) piSheet.getRange(rowNum, updatedAtIndex + 1).setValue(now);
          break;
        }
      }
    }

    // Delete existing line items
    const piLineData = piLineSheet.getDataRange().getValues();
    const piLineHeaders = piLineData[0];
    const piIdIndex = piLineHeaders.indexOf("purchaseInvoiceId");
    
    for (let i = piLineData.length - 1; i >= 1; i--) {
      if (piLineData[i][piIdIndex] === piId) {
        piLineSheet.deleteRow(i + 1);
      }
    }

    // Add new line items
    if (formData.lineItems && formData.lineItems.length > 0) {
      formData.lineItems.forEach(item => {
        const newLineRow = piLineHeaders.map(header => {
          const lineId = Utilities.getUuid();
          switch(header) {
            case "id": return item.id && !item.id.startsWith('line-') ? item.id : lineId;
            case "purchaseInvoiceId": return piId;
            case "PurchaseOrderLineId": return item.poLineId;
            case "itemDescription": return item.itemDescription;
            case "quantity": return item.quantity;
            case "currency": return item.currency;
            case "unitPrice": return item.unitPrice;
            case "total": return item.total;
            case "productId": return item.productId;
            case "expectedReceivingDate": return item.expectedReceivingDate;
            default: return "";
          }
        });
        piLineSheet.appendRow(newLineRow);
      });
    }

    return "Purchase Invoice saved successfully!";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

function updatePurchaseInvoiceStatus(piId, newStatus) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const piSheet = ss.getSheetByName("PurchaseInvoice");
    
    if (!piSheet) return "Error: PurchaseInvoice sheet not found";

    const piData = piSheet.getDataRange().getValues();
    const piHeaders = piData[0];
    const idIndex = piHeaders.indexOf("id");
    const statusIndex = piHeaders.indexOf("status");

    const rows = piData.slice(1);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idIndex] === piId) {
        const rowNum = i + 2;
        if (statusIndex !== -1) piSheet.getRange(rowNum, statusIndex + 1).setValue(newStatus);
        return "Status updated successfully";
      }
    }
    return "Purchase Invoice not found";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

// ============ SALES INVOICE FUNCTIONS ============

function getSalesInvoiceData() {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("SalesInvoice");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    return normalizeSheetRows(data);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function getSalesInvoiceLinesBySI(siId) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("SalesInvoiceLine");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    const lines = normalizeSheetRows(data);
    return lines.filter(line => line.salesInvoiceId === siId);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function getCustomerData() {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("Customer");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    return normalizeSheetRows(data);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

// ============ EXPORT LC FUNCTIONS ============

function getExportLCData() {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("ExportLC");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    return normalizeSheetRows(data);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

function getExportLCLinesByLC(lcId) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("ExportLCLine");
    if (!sheet) return [];

    const data = sheet.getDataRange().getDisplayValues();
    if (data.length < 2) return [];

    const lines = normalizeSheetRows(data);
    return lines.filter(line => line.ExportlcId === lcId);
  } catch (e) {
    Logger.log(e.toString());
    return [];
  }
}

// ============ SALES INVOICE SAVE/DELETE/UPDATE FUNCTIONS ============

function saveSalesInvoice(formData) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const siSheet = ss.getSheetByName("SalesInvoice");
    const siLineSheet = ss.getSheetByName("SalesInvoiceLine");
    
    if (!siSheet || !siLineSheet) return "Error: Required sheets not found";

    const siData = siSheet.getDataRange().getValues();
    const siHeaders = siData[0];
    const now = new Date();
    let siId = formData.id;

    if (!siId) {
      siId = Utilities.getUuid();
      const siNumber = "SI-" + now.getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
      const companyId = "DEFAULT-COMP-01";
      
      const newSIRow = siHeaders.map(header => {
        switch(header) {
          case "id": return siId;
          case "invoiceNumber": return siNumber;
          case "companyId": return companyId;
          case "customerId": return formData.customerId;
          case "purchaseOrderId": return formData.purchaseOrderId;
          case "invoiceDate": return formData.invoiceDate;
          case "expectedFinalDeliveryDate": return formData.expectedFinalDeliveryDate;
          case "currency": return formData.currency;
          case "totalForeign": return formData.totalForeign;
          case "status": return formData.status || "Pending";
          case "createdById": return "USER-01";
          case "createdAt": return now;
          case "updatedAt": return now;
          default: return "";
        }
      });
      siSheet.appendRow(newSIRow);
    } else {
      const rows = siData.slice(1);
      const idIndex = siHeaders.indexOf("id");
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][idIndex] === siId) {
          const rowNum = i + 2;
          const statusIndex = siHeaders.indexOf("status");
          const totalIndex = siHeaders.indexOf("totalForeign");
          const updatedAtIndex = siHeaders.indexOf("updatedAt");
          
          if (statusIndex !== -1) siSheet.getRange(rowNum, statusIndex + 1).setValue(formData.status);
          if (totalIndex !== -1) siSheet.getRange(rowNum, totalIndex + 1).setValue(formData.totalForeign);
          if (updatedAtIndex !== -1) siSheet.getRange(rowNum, updatedAtIndex + 1).setValue(now);
          break;
        }
      }
    }

    // Delete existing line items
    const siLineData = siLineSheet.getDataRange().getValues();
    const siLineHeaders = siLineData[0];
    const siIdIndex = siLineHeaders.indexOf("salesInvoiceId");
    
    for (let i = siLineData.length - 1; i >= 1; i--) {
      if (siLineData[i][siIdIndex] === siId) {
        siLineSheet.deleteRow(i + 1);
      }
    }

    // Add new line items
    if (formData.lineItems && formData.lineItems.length > 0) {
      formData.lineItems.forEach(item => {
        const newLineRow = siLineHeaders.map(header => {
          const lineId = Utilities.getUuid();
          switch(header) {
            case "id": return item.id && !item.id.startsWith('line-') ? item.id : lineId;
            case "salesInvoiceId": return siId;
            case "itemDescription": return item.itemDescription;
            case "quantity": return item.quantity;
            case "currency": return item.currency;
            case "unitPrice": return item.unitPrice;
            case "total": return item.total;
            case "productId": return item.productId;
            case "expectedDeliveryDate": return item.expectedDeliveryDate;
            default: return "";
          }
        });
        siLineSheet.appendRow(newLineRow);
      });
    }

    return "Sales Invoice saved successfully!";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

function deleteSalesInvoice(siId) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const siSheet = ss.getSheetByName("SalesInvoice");
    const siLineSheet = ss.getSheetByName("SalesInvoiceLine");
    
    if (!siSheet || !siLineSheet) return "Error: Required sheets not found";

    // Delete SI
    const siData = siSheet.getDataRange().getValues();
    const siHeaders = siData[0];
    const idIndex = siHeaders.indexOf("id");

    for (let i = siData.length - 1; i >= 1; i--) {
      if (siData[i][idIndex] === siId) {
        siSheet.deleteRow(i + 1);
        break;
      }
    }

    // Delete SI line items
    const siLineData = siLineSheet.getDataRange().getValues();
    const siLineHeaders = siLineData[0];
    const siIdIndex = siLineHeaders.indexOf("salesInvoiceId");

    for (let i = siLineData.length - 1; i >= 1; i--) {
      if (siLineData[i][siIdIndex] === siId) {
        siLineSheet.deleteRow(i + 1);
      }
    }

    return "Sales Invoice deleted successfully!";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

function updateSalesInvoiceStatus(siId, newStatus) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const siSheet = ss.getSheetByName("SalesInvoice");
    
    if (!siSheet) return "Error: SalesInvoice sheet not found";

    const siData = siSheet.getDataRange().getValues();
    const siHeaders = siData[0];
    const idIndex = siHeaders.indexOf("id");
    const statusIndex = siHeaders.indexOf("status");

    const rows = siData.slice(1);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idIndex] === siId) {
        const rowNum = i + 2;
        if (statusIndex !== -1) siSheet.getRange(rowNum, statusIndex + 1).setValue(newStatus);
        return "Status updated successfully";
      }
    }
    return "Sales Invoice not found";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

// ============ EXPORT LC SAVE/DELETE/UPDATE FUNCTIONS ============

function saveExportLC(formData) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const lcSheet = ss.getSheetByName("ExportLC");
    const lcLineSheet = ss.getSheetByName("ExportLCLine");
    
    if (!lcSheet || !lcLineSheet) return "Error: Required sheets not found";

    const lcData = lcSheet.getDataRange().getValues();
    const lcHeaders = lcData[0];
    const now = new Date();
    let lcId = formData.id;

    if (!lcId) {
      lcId = Utilities.getUuid();
      const lcNumber = "LC-" + now.getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
      const companyId = "DEFAULT-COMP-01";
      
      const newLCRow = lcHeaders.map(header => {
        switch(header) {
          case "id": return lcId;
          case "lcNumber": return lcNumber;
          case "companyId": return companyId;
          case "customerId": return formData.customerId;
          case "bankName": return formData.bankName;
          case "amount": return formData.amount;
          case "currency": return formData.currency;
          case "issueDate": return formData.issueDate;
          case "expiryDate": return formData.expiryDate;
          case "status": return formData.status || "Pending";
          case "description": return formData.description;
          case "loanType": return formData.loanType;
          case "loanValue": return formData.loanValue;
          case "lastReceiptDate": return formData.lastReceiptDate;
          case "bankBranch": return formData.bankBranch;
          case "createdById": return "USER-01";
          case "createdAt": return now;
          case "updatedAt": return now;
          default: return "";
        }
      });
      lcSheet.appendRow(newLCRow);
    } else {
      const rows = lcData.slice(1);
      const idIndex = lcHeaders.indexOf("id");
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][idIndex] === lcId) {
          const rowNum = i + 2;
          const statusIndex = lcHeaders.indexOf("status");
          const updatedAtIndex = lcHeaders.indexOf("updatedAt");
          
          if (statusIndex !== -1) lcSheet.getRange(rowNum, statusIndex + 1).setValue(formData.status);
          if (updatedAtIndex !== -1) lcSheet.getRange(rowNum, updatedAtIndex + 1).setValue(now);
          break;
        }
      }
    }

    // Delete existing line items
    const lcLineData = lcLineSheet.getDataRange().getValues();
    const lcLineHeaders = lcLineData[0];
    const lcIdIndex = lcLineHeaders.indexOf("exportLCId");
    
    for (let i = lcLineData.length - 1; i >= 1; i--) {
      if (lcLineData[i][lcIdIndex] === lcId) {
        lcLineSheet.deleteRow(i + 1);
      }
    }

    // Add new line items (shipment details)
    if (formData.lineItems && formData.lineItems.length > 0) {
      formData.lineItems.forEach(item => {
        const newLineRow = lcLineHeaders.map(header => {
          const lineId = Utilities.getUuid();
          switch(header) {
            case "id": return item.id && !item.id.startsWith('line-') ? item.id : lineId;
            case "exportLCId": return lcId;
            case "shipmentId": return item.shipmentId;
            case "shipmentDate": return item.shipmentDate;
            case "shipmentAmount": return item.shipmentAmount;
            default: return "";
          }
        });
        lcLineSheet.appendRow(newLineRow);
      });
    }

    return "Export LC saved successfully!";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

function deleteExportLC(lcId) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const lcSheet = ss.getSheetByName("ExportLC");
    const lcLineSheet = ss.getSheetByName("ExportLCLine");
    
    if (!lcSheet || !lcLineSheet) return "Error: Required sheets not found";

    // Delete LC
    const lcData = lcSheet.getDataRange().getValues();
    const lcHeaders = lcData[0];
    const idIndex = lcHeaders.indexOf("id");

    for (let i = lcData.length - 1; i >= 1; i--) {
      if (lcData[i][idIndex] === lcId) {
        lcSheet.deleteRow(i + 1);
        break;
      }
    }

    // Delete LC line items
    const lcLineData = lcLineSheet.getDataRange().getValues();
    const lcLineHeaders = lcLineData[0];
    const lcIdIndex = lcLineHeaders.indexOf("exportLCId");

    for (let i = lcLineData.length - 1; i >= 1; i--) {
      if (lcLineData[i][lcIdIndex] === lcId) {
        lcLineSheet.deleteRow(i + 1);
      }
    }

    return "Export LC deleted successfully!";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}

function updateExportLCStatus(lcId, newStatus) {
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const lcSheet = ss.getSheetByName("ExportLC");
    
    if (!lcSheet) return "Error: ExportLC sheet not found";

    const lcData = lcSheet.getDataRange().getValues();
    const lcHeaders = lcData[0];
    const idIndex = lcHeaders.indexOf("id");
    const statusIndex = lcHeaders.indexOf("status");

    const rows = lcData.slice(1);
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][idIndex] === lcId) {
        const rowNum = i + 2;
        if (statusIndex !== -1) lcSheet.getRange(rowNum, statusIndex + 1).setValue(newStatus);
        return "Status updated successfully";
      }
    }
    return "Export LC not found";
  } catch (e) {
    Logger.log(e.toString());
    return "Error: " + e.toString();
  }
}