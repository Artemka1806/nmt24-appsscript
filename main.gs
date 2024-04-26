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
    // .addItem("setProperties", "NMTparserlib.setP")
    // .addItem("getProperties", "NMTparserlib.getP")
    .addToUi();
}
//testData = testData

function showSidebar() {
  html = HtmlService.createTemplateFromFile('index').evaluate().setTitle("Шаблони")//.setWidth(250).setHeight(300);
  DocumentApp.getUi().showSidebar(html);
}

function getP() {
  let data = getSettingsFromProperties()
  DocumentApp.getUi().alert(`Параметри документу:
Предмет: ${data.subject}
Статус: ${data.status}
Тип: ${data.type}
Час на виконання тесту: ${data.time} хвилин`);
}


function setP(){
  saveSettingsToProperties(8, false, 0, 5)
}

//-----------------------------------------------------------------------------
function onEdit(e) {

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
  // var options = {
  //   'method': 'post',
  //   'payload': {
  //     'testId': document.getId(),
  //     'param': param,
  //     'value': value
  //   }
  // };
  // UrlFetchApp.fetch(serverUrl + '/rest/v1/test/changeParam', options);
}

function saveSettingsToProperties(subject, status, type, time) {
  let documentSettings = {
    'subject': subject,
    'status': status,
    'type': type,
    'time': time
  };

  documentProperties.setProperty('SETTINGS', JSON.stringify(documentSettings));
}

function getSettingsFromProperties() {
  let documentSettings = documentProperties.getProperty('SETTINGS');
  return JSON.parse(documentSettings)
}

function saveSettings(subject, status, type, time) {
  Logger.log(subject, status, type, time)
  let title = document.getName().split(' ')
  let statusTitle;
  let typeOfTestTitle;

  if (status == true) {
    statusTitle = '✅'
  } else if (status == false) {
    statusTitle = '⛔'
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

  saveSettingsToProperties(subject, status, type, time);
  // setServerParam("subject", subject);
  // setServerParam("status", status);
  // setServerParam("type", parseInt(type));
  // setServerParam("testTime", parseInt(time));

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

  NMTparserlib.main()
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
  let settings = getSettingsFromProperties();

  if (settings.subject == null) {
    settings.subject = 0
  }

  if (settings.status == null || settings.status=="false") {
    settings.status = false
  } else if (settings.status=="true"){
    settings.status = true
  }

  if (settings.type == null) {
    settings.type = 1
  }

  if (settings.time == null){
    settings.time = 60
  }
  
  let statusTitle;
  if (settings.status == true) {
    statusTitle = '✅'
  } else if (settings.status == false) {
    statusTitle = '⛔'
  }
  let typeOfTestTitle;
  if (settings.type == 1) {
    typeOfTestTitle = 'НМТ'
  } else if (settings.type == 0) {
    typeOfTestTitle = 'Навчальний'
  }

  let ui = DocumentApp.getUi();
  let response = ui.alert(`Ваш тест буде загружено на сервер з такими параметрами:
Предмет: ${Object.keys(subjects)[settings.subject]}
Статус: ${statusTitle}
Тип: ${typeOfTestTitle}
Час на виконання тесту: ${settings.time} хвилин`, ui.ButtonSet.YES_NO);

  // Process the user's response.
  if (response == ui.Button.NO) {
    return false;
  }
  

  if (settings.subject != null) {
    let formData = {
      "testId": DocumentApp.getActiveDocument().getId(),
      "name": DocumentApp.getActiveDocument().getName(),
      "subject": settings.subject,
      "questions": JSON.stringify(qToDB),
      "status": settings.status,
      "type": settings.type,
      "testTime": settings.time,
    };
    let options = {
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