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
  try {
    const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
    const sheet = ss.getSheetByName("Vendor"); 
    
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
  const ss = SpreadsheetApp.openById("1cKXoF2FolC4Psgy6aptb7CmGUNCfq6v5zSzipJGPUVw");
  const sheet = ss.getSheetByName("Vendor");
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