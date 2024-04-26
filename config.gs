try {
  var serverUrl =  PropertiesService.getScriptProperties().getProperty("serverUrl")
  var document = DocumentApp.getActiveDocument();
  var body = document.getBody();
  var cache = CacheService.getDocumentCache();
  var documentProperties = PropertiesService.getDocumentProperties();
} catch (error) {

}

// Об'єкт типів завдань
const typesOfTask = {
  "Вибір з 4": '1QEO4E4fSXajQb_hO9PcsMqciFvdbljGr44ffStgy9h4',             //0
  "Вибір з 5": '1xymLVS_oOWjixHuIcgXttxj_8D3KA_tmz4f2Y65aWes',             //1
  "Відповідність 3 на 5": '19cpf0wYtvNSgty139mH43BSiu9_Grhp-0UrQAWXOPiQ',  //2
  "Відповідність 4 на 4": '1rYtyU8CYIuRHvxC7Aj4pgYkHsDBvn0ZaPoPpwA1RTgg',  //3
  "Відповідність 4 на 5": '1v9ajT72S5q09WpbTATCRKP7YnQ6Mzt_Wvce9CdIJevI',  //4
  "Відповідність 5 на 4": '1G9UXpu6akAH87xZlzbfXk-TwQ2wqYmY89x81XtgTiPs',  //5  
  "Відповідність 5 на 8": '1P9H_CoN5EklPp4Ls4klZLslDO-3kre9RROoXk4xtnkY',  //6
  "Відповідність 6 на 8": '1_qSZhvjg_kYptlcrq4ZQXMgmzorgwIpYDmus3rg8pEY',  //7
  "Введення 1": '1GgfV9EqekfEKtHPnal_QZy0QkFiDM-Zn6z-YIjJeN6U',            //8
  "Введення 2": '19CjB4cPvwRrcF2wuIZU8qhYnPMMaqag5y0wYPnVhrkk',            //9 
  "Введення 3": '1Nqc9cD5vqkj7tCe5BgTpkoZJqZBgqBz96AKiPiievtI',            //10 
  "Select 4": '1PS73RF_ZHKMbWDB4un_HrGlEVnv5ZKbDEhrbOxXSTxM',              //11
  "Select 8": '1gfJYkltxwX0BS4IpUdDc3-Oau_YjLo_-Nq7aSUqqboU'               //12

}

// Об'єкт предметів
const subjects = {
  "Історія України": "1G0Tjo4Vu-8mQgLyTAZpcM9mkMc2CQ2x_",         //0 
  "Математика": "1DyqQeGTB0hyvFsXcie8wtZg6gTXXm5c2",              //1
  "Українська мова": "1H6miF5gs7wBlrAkHyEYAkT_lFdKjS9Xn",         //2
  "Англійська мова": "14VNxUhr9CWTXEkNyZEHPlqdkCmGIYtEY",         //3
  "Фізика": "1w39PWtD-h2sty7uhKMoE1D8ROANKwFxI",                  //4
  "Хімія": "16D50jww7LHw1wovmqtjZ94ROPgS-55Te",                   //5
  "Біологія": "1ZAlP6fZ3nJJ4QZ3ZlNviIaJytKsBsvsM",                //6
  "Географія": "1HWdPc_7fTtFJMUYRWjQ_GiiNoWiYTs79",               //7
  "Інформатика": "1EUojiawlXL8Px_HrfwHjOg_-EYC0Wpsm",             //8
  "Українська література": "1Ypl5WEIZxReM5LP6Lmb_u-6ZWbgyhqjz",   //9
}