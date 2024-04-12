// try{
//   var cache = CacheService.getDocumentCache();
// } catch(error){

// }

//-----------------------------------------------------------------------------

function onOpen(e) {
  const ui = DocumentApp.getUi();
  //saveTestData()
  ui.createMenu("НМТ")
    .addItem("✨ Шаблони", "NMTparserlib.showSidebar")
    .addToUi();
}
//testData = testData

function showSidebar() {
  html = HtmlService.createTemplateFromFile('index').evaluate().setTitle("Шаблони")//.setWidth(250).setHeight(300);
  DocumentApp.getUi().showSidebar(html);
}

//-----------------------------------------------------------------------------
function onEdit(e) {

}

function allTestsVisible() {
  let folders = DriveApp.getFolderById("1sbE13_qHXHfNeaT21IMwKp5-5xYkRhQj").getFolders()
  while (folders.hasNext()) {
    let folder = folders.next();
    let files = folder.getFiles();

    while (files.hasNext()) {
      let file = files.next();

      let formData = {
        'testId': file.getId(),
        'param': "status",
        'value': true
      };
      Logger.log(formData)
      let options = {
        'method': 'post',
        'payload': formData
      };
      try {
        UrlFetchApp.fetch(serverUrl + '/rest/v1/test/changeParam', options);
      } catch (error) {
        Logger.log(error)
      }
    }
  }
  DocumentApp.getUi().alert("Успішно зроблено всі тести видимими")
}

function allTestsInisible() {
  let folders = DriveApp.getFolderById("1sbE13_qHXHfNeaT21IMwKp5-5xYkRhQj").getFolders()
  while (folders.hasNext()) {
    let folder = folders.next();
    let files = folder.getFiles();

    while (files.hasNext()) {
      let file = files.next();

      let formData = {
        'testId': file.getId(),
        'param': "status",
        'value': false
      };
      Logger.log(formData)
      let options = {
        'method': 'post',
        'payload': formData
      };
      try {
        UrlFetchApp.fetch(serverUrl + '/rest/v1/test/changeParam', options);
      } catch (error) {
        Logger.log(error)
      }
    }
  }
  DocumentApp.getUi().alert("Успішно зроблено всі тести невидимими")
}



function getTemplates() {
  return Object.keys(typesOfTask)
}

function pTemplate(name) {
  NMTparserlib.pasteTemplate(typesOfTask[name])
}

function getSubjects() {
  return Object.keys(subjects)
}


function setServerParam(param, value) {
  Logger.log(param + ": " +value)
  cache.put(param, value, 60 * 60 * 24 * 365)
  var options = {
    'method': 'post',
    'payload': {
      'testId': document.getId(),
      'param': param,
      'value': value
    }
  };
  UrlFetchApp.fetch(serverUrl + '/rest/v1/test/changeParam', options);
}

function saveSettings(subject, status, type, time) {
  setServerParam("subject", subject);

  let title = document.getName().split(' ')
  let statusTitle;
  let typeOfTestTitle;

  if (status == true) {
    statusTitle = 'Доступний'
  } else if (status == false) {
    statusTitle = 'Недоступний'
  }

  if (type == 1) {
    typeOfTestTitle = 'НМТ'
  } else if (type == 0) {
    typeOfTestTitle = 'Навчальний'
  }

  var ui = DocumentApp.getUi();
  let response = ui.alert(`Будуть збережені такі параметри:
Предмет: ${Object.keys(subjects)[subject]}
Статус: ${statusTitle}
Тип: ${typeOfTestTitle}
Час на виконання тесту: ${time} хвилин`, ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (response == ui.Button.NO) {
    return false;
  }

  setServerParam("status", status);
  setServerParam("type", parseInt(type));
  setServerParam("testTime", parseInt(time));

  var newTitle = statusTitle + ' ' + typeOfTestTitle + ' ' + title[2] + ' ' + Object.keys(subjects)[subject] + " " + time + " хв";
  document.setName(newTitle)
  var header = document.getHeader();
  if (header) {
    header
      .setText(newTitle)
      .setForegroundColor('#D4D4D4')
      .setItalic(true)
      .setBold(false);
  } else {
    document.addHeader().setText(newTitle);
  }
  moveDocumentToFolder(document.getId(), Object.values(subjects)[parseInt(subject)])
}


function pasteTemplate(source) {
  targetFileId = DocumentApp.getActiveDocument().getId();
  sourceDocument = DocumentApp.openById(source);
  targetDocument = DocumentApp.openById(targetFileId);
  NMTparserlib.copyContent(sourceDocument.getBody(), targetDocument.getBody());
  targetDocument.getBody().appendHorizontalRule();
  NMTparserlib.numerateQuestion()
  //DocumentApp.getUi().alert("Успішно вставлено")
  return 0
}




var copyContent = function (source, target) {
  for (var i = 0; i < source.getNumChildren(); i++) {
    Logger.log(source.getChild(i).getType())
    var child = source.getChild(i).copy();

    if (child.ty === DocumentApp.ElementType.TABLE) {
      target.appendTable(child);
    } else if (child.getType() === DocumentApp.ElementType.LIST_ITEM) {
      target.appendListItem(child);
    } else if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
      target.appendParagraph(child);
    } else if (child.getType() === DocumentApp.ElementType.INLINE_DRAWING) {
      target.appendParagraph(child);
    }
  }
}


function main() {
  subject = cache.get("subject");
  if (subject == null) {
    subject = 0
  }

  status = cache.get("status");
  if (status == null || status=="false") {
    status = false
  } else {
    status = true
  }
  cache.put("status", status, 60 * 60 * 12 * 365)

  type = cache.get("type");
  if (type == null) {
    type = 1
    cache.put("type", type, 60 * 60 * 12 * 365)
  }

  time = cache.get("time")
  if (time == null){
    time = 60
  }
  let statusTitle;
  if (status == true) {
    statusTitle = 'Доступний'
  } else if (status == false) {
    statusTitle = 'Недоступний'
  }
  let typeOfTestTitle;
  if (type == 1) {
    typeOfTestTitle = 'НМТ'
  } else if (type == 0) {
    typeOfTestTitle = 'Навчальний'
  }

  var ui = DocumentApp.getUi();
  let response = ui.alert(`Ваш тест буде загружено на сервер з такими параметрами:
Предмет: ${Object.keys(subjects)[subject]}
Статус: ${statusTitle}
Тип: ${typeOfTestTitle}
Час на виконання тесту: ${time} хвилин`, ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (response == ui.Button.NO) {
    return false;
  }

  qToDB = [];
  // Отримання HTML документа і заміна спец. символів на Unicode (ну тіпа пачєму би і нєт?)
  var data = replaceSymbols(getContent(document.getId(), false)).replace("<h1></h1>", "");

  // Розбивка HTML на список з завданнями
  var questions = data.split("<hr>");
  for (var question = 0; question < questions.length; question++) {
    var currentQuestion = questions[question];


    if (!currentQuestion) {
      break
    }

    if (isEmpty(currentQuestion) == false) {
      try {
        var header = currentQuestion.split("<h1>")[1].split("</h1>")[0];
      } catch (error) {
        Logger.log('Сталася помилка при виявленні заголовку завдання' + (question + 1) + '.\nДодайте заголовок в ' + (question + 1) + ' завданні.\nЯкщо ж цього завдання не існує, видаліть все після горизонтальної лінії ' + (question + 1) + ' завдання')
        DocumentApp.getUi().alert('Сталася помилка при виявленні заголовку завдання' + (question + 1) + '.\nДодайте заголовок в ' + (question + 1) + ' завданні.\nЯкщо ж цього завдання не існує, видаліть все після горизонтальної лінії ' + (question + 1) + ' завдання')
        return 0;
      }
      try {
        var correctAnswers = getAnswersArray(currentQuestion.split("&lt;key&gt;")[1].split("&lt;/key&gt;")[0]);
      } catch (error) {
        Logger.log('Сталася помилка при виявленні правильних відповідей завдання ' + (question + 1) + '}.\nДодайте нумерований список з відповідями між <key> і </key> в ' + (question + 1) + ' завданні')
        DocumentApp.getUi().alert('Сталася помилка при виявленні правильних відповідей завдання ' + (question + 1) + '}.\nДодайте нумерований список з відповідями між <key> і </key> в ' + (question + 1) + ' завданні')
        return 0;
      }


      // Виявлення типу завдання для їх правильної обробки на сайті:
      // -1 - Неправильний тип запитання
      // 0 - Тестові завдання з однією відповіддю
      // 1 - Тестові завдання з декількома відповідями
      // 2 - Завдання на введення
      try {
        var qtype = Object.keys(typesOfTask).indexOf(currentQuestion.split("&lt;type&gt;")[1].split("&lt;/type&gt;")[0]);
      } catch (error) {
        Logger.log('Сталася помилка при виявленні типу завдання ' + (question + 1) + '. Виправте текст між <type> і </type> в ' + (question + 1) + ' завданні');
        DocumentApp.getUi().alert('Сталася помилка при виявленні типу завдання ' + (question + 1) + '. Виправте текст між <type> і </type> в ' + (question + 1) + ' завданні');
        return 0;
      }


      if (qtype != -1) {
        // Парсинг "тіла" запитання і застосування стилів, які потрібні для правильного відображення на сайті
        Logger.log(question)
        var body = currentQuestion.split("&lt;/type&gt;</p>")[1].split("<p>&lt;key&gt;")[0].replace("<p></p>", "").replace("</p><p></p>", "</p>").replace("<p", '<p class="question-text"').replace("<p>", '<p class="question-text">').replace("<img", '<img class="question-img"');

      } else {
        Logger.log('Сталася помилка при виявленні типу завдання ' + (question + 1) + '. Виправте текст між <type> і </type> в ' + (question + 1) + ' завданні');
        DocumentApp.getUi().alert('Сталася помилка при виявленні типу завдання ' + (question + 1) + '. Виправте текст між <type> і </type> в ' + (question + 1) + ' завданні');
        return 0;
      }

      qToDB[question] = {
        "type": qtype,
        "header": header,
        "body": body,
        "correctAnswers": correctAnswers,
        //"status": status
      }
    }
  }
  

  if (subject != null) {
    var formData = {
      "testId": DocumentApp.getActiveDocument().getId(),
      "name": DocumentApp.getActiveDocument().getName(),
      "subject": subject,
      "questions": JSON.stringify(qToDB),
      "status": status,
      "testType": type,
      "testTime": time,
    };
    var options = {
      'method': 'post',
      'payload': formData
    };
    
    UrlFetchApp.fetch(serverUrl + '/rest/v1/test/create', options);

    //uploadToServer(qToDB);
    //DocumentApp.getUi().showModalDialog(htmlOutput, 'My add-on');
    //DocumentApp.getUi()
    try {
      DocumentApp.getUi().alert("Успішно завантажено на сервер!")
    } catch (error) {

    }
    return 0
  } else {
    throw ('Не вказано предмет. Вкажіть його в меню "Предмет"')
  }
}