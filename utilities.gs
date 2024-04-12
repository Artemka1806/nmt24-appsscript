

function getAnswersArray(answer) {
  regex = /<li>(.*?)<\/li>/g;
  var matches;
  answersArray = [];
  // Пошук усіх відповідних елементів у HTML
  while (matches = regex.exec(answer)) {
    answersArray.push(matches[1]);
  }
  return answersArray
}


function replaceSymbols(text) {
  var specialCharsRegex = /&#(\d+);/g;
  var replacedText = text.replace(specialCharsRegex, function (match, code) {
    return String.fromCharCode(parseInt(code, 10));
  });
  return replacedText;
}


function isEmpty(string) {
  clearedString = replaceSymbols(string.replace(/(\<(\/?[^>]+)>)/g, '')).replace("&nbsp;", "").replace(" ", "");
  if (clearedString == "") {
    return true;
  } else {
    return false;
  }
}


function getContent(id, useCaching) {

  if (!id) {
    throw "Please call this API with a valid Google Doc ID";
  }

  if (useCaching == null) {
    useCaching = true;
  }

  if (typeof useCaching != "boolean") {
    throw "If you're going to specify useCaching, it must be boolean.";
  }

  var cache = CacheService.getScriptCache();
  var cached = cache.get(id); // see if we have a cached version of our parsed html
  if (cached && useCaching) {
    var html = cached;
    // Logger.log("Pulling doc html from cache...");
  } else {

    // Logger.log("Grabbing and parsing fresh html from the doc...");

    try {
      var doc = DriveApp.getFileById(id);
    } catch (err) {
      throw "Please call this API with a valid Google Doc ID. " + err.message;
    }

    var docName = doc.getName();

    var forDriveScope = DriveApp.getStorageUsed(); // needed to get Drive Scope requested in ScriptApp.getOAuthToken();
    var url = "https://docs.google.com/feeds/download/documents/export/Export?id=" + id + "&exportFormat=html";
    var param = {
      method: "get",
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    };

    var html = UrlFetchApp.fetch(url, param).getContentText();

    // nuke the whole head section, including the stylesheet and meta tag
    html = html.replace(/<head>.*<\/head>/, '');
    // remove almost all html attributes
    html = html.replace(/ (id|class|style|start|colspan|rowspan)="[^"]*"/g, '');
    // remove all of the spans, as well as the outer html and body
    html = html.replace(/<(span|\/span|body|\/body|html|\/html)>/g, '');
    // clearly the superior way of denoting line breaks
    html = html.replace(/<br>/g, '<br />');

    cache.put(id, html, 900) // cache doc contents for 15 minutes, in case we get a lot of requests

  }

  //Logger.log(html);

  return html;

}



//Автоматична нумерація завдань
function numerateQuestion() {
  var paragraphs = document.getBody().getParagraphs();
  var counter = 1;
  for (var i = 0; i < paragraphs.length; i++) {
    var paragraph = paragraphs[i];
    var text = paragraph.getText();
    if (text.indexOf('Завдання № ') == 0) {
      paragraph.setText('Завдання № ' + counter)
      paragraph.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      counter++
    }
    if (text.indexOf('TASK № ') == 0) {
      paragraph.setText('TASK № ' + counter)
      paragraph.setHeading(DocumentApp.ParagraphHeading.HEADING1);
      counter++
    }
  }
}

//Перенесення документу в папку з предметом
function moveDocumentToFolder(documentId, folderId) {
  var document = DriveApp.getFileById(documentId);
  var folder = DriveApp.getFolderById(folderId);
  document.moveTo(folder)
}

//Очистка документу
function clearAll() {
  //console.log('clearAll')
  //Очистити вміст документа
  body.clear();
}

