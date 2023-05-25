function flattenObjectOuter(obj) {
  var newObj = {};

  function flattenObject(obj) {
    var keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = obj[key];
      if (value && typeof value == "object") {
        continue;
      } else {
        if(!newObj[key]) newObj[key] = value;
        else continue
      }
    }

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = obj[key];
      if (value && typeof value == "object") {
        flattenObject(value);
      } else {
        continue;
      }
    }

    return newObj;
  }
  return flattenObject(obj);
}

export default flattenObjectOuter;