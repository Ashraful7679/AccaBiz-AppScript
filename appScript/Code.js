function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Business ERP System')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    console.warn("File not found: " + filename);
    return "";
  }
}

function stripHtmlWrapper(content) {
  if (!content) return content;
  return content
    .replace(/<!DOCTYPE html>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    .replace(/<\/html>/gi, '');
}

function getPageContent(pageName) {
  // ১. মেইন HTML ফাইলটি নিন
  let html = stripHtmlWrapper(include(pageName));
  
  // ২. সিএসএস এবং জেএস ফাইলগুলো নিন
  let css = include(pageName + '-css');
  if (!css) {
    css = include('SharedPageStyles');
  }
  let js = stripHtmlWrapper(include(pageName + '-js'));
  let sharedJs = include('SharedPageScript');

  if (!html) {
    html = '<div class="page-wrapper">'
         + '<div class="page-header">'
         + '<div class="title-section">'
         + '<h2>Page not found</h2>'
         + '<p class="subtitle">The requested page is missing or not available yet.</p>'
         + '</div></div>'
         + '<div class="page-content">'
         + '<p>Please check the menu entry or add the missing HTML file.</p>'
         + '</div></div>';
  }
  
  // সবগুলোকে একসাথে যোগ করে রিটার্ন করুন
  return css + html + sharedJs + js;
}