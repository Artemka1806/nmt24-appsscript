function getSubject() {
  let data = getSettingsFromProperties();
  if (data.subject == null) {
    return 0;
  }
  return data.subject;
}

function getStatus() {
  let data = getSettingsFromProperties();
  if (data.status == "true") {
    return true;
  } else if (data.status == "false" || data.status == null) {
    return false;
  }
  return data.status;
}

function getType() {
  let data = getSettingsFromProperties();
  if (data.type == null) {
    return 1
  }
  return parseInt(data.type);
}

function getTime() {
  let data = getSettingsFromProperties();
  if (data.time == null) {
    return 60
  }
  return parseInt(data.time);
}