function getSubject() {
  let subject = cache.get("subject");
  if (subject == null) {
    return 0;
  }
  return subject;
}

function getStatus() {
  let status = cache.get("status");
  if (status == "true") {
    return true;
  } else if (status == "false" || status == null) {
    return false;
  }
  return status;
}

function getType() {
  let type = cache.get("type");
  if (type == null) {
    return 1
  }
  return parseInt(type);
}

function getTime() {
  let time = cache.get("time");
  if (time == null) {
    return 60
  }
  return parseInt(time);
}