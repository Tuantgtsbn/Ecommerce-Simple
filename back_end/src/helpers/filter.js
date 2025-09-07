const filteredObject = (object) => {
  const filteredObject = {};
  Object.keys(object).forEach((key) => {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ""
    ) {
      if (typeof object[key] === "object" && Object.keys(value).length === 0) {
        return;
      }
      filteredObject[key] = object[key];
    }
  });
  return isEmptyObject(filteredObject) ? {} : filteredObject;
};

const isEmptyObject = (object) => {
  return (
    typeof object === "object" && // phải là object
    object !== null && // không phải null
    !Array.isArray(object) && // không phải array
    Object.keys(object).length === 0 // không có key nào
  );
};

function cleanObject(obj, keys) {
  if (obj === null || obj === undefined) return undefined;

  if (Array.isArray(obj)) {
    // xử lý array: clean từng phần tử rồi filter bỏ rỗng
    return obj
      .map((item) =>
        cleanObject(
          item,
          typeof item === "object" && item ? Object.keys(item) : [],
        ),
      )
      .filter((item) => {
        const isUndefined = item === undefined;
        const isNull = item === null;
        const isEmptyString = item === "";
        const isEmptyObject =
          typeof item === "object" &&
          item !== null &&
          !Array.isArray(item) &&
          Object.keys(item).length === 0;
        const isEmptyArray = Array.isArray(item) && item.length === 0;

        return !(
          isUndefined ||
          isNull ||
          isEmptyString ||
          isEmptyObject ||
          isEmptyArray
        );
      });
  }

  if (typeof obj === "object") {
    const newObj = {};
    for (const key of keys) {
      if (!Object.hasOwn(obj, key)) continue;

      const value = cleanObject(
        obj[key],
        typeof obj[key] === "object" && obj[key] ? Object.keys(obj[key]) : [],
      );

      const isUndefined = value === undefined;
      const isNull = value === null;
      const isEmptyString = value === "";
      const isEmptyObject =
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0;
      const isEmptyArray = Array.isArray(value) && value.length === 0;

      if (
        isUndefined ||
        isNull ||
        isEmptyString ||
        isEmptyObject ||
        isEmptyArray
      ) {
        continue;
      }

      newObj[key] = value;
    }
    return newObj;
  }

  // các giá trị nguyên thủy khác (string, number, boolean)
  return obj;
}

module.exports = {filteredObject, isEmptyObject, cleanObject};
