export const dataProcess = (Obj, newArray = []) => {
  for (const key in Obj) {
    if (Object.hasOwnProperty.call(Obj, key)) {
      const value = Obj[key];
      newArray.push(value);
      if (typeof value === "object" && value.underling) {
        const underling = dataProcess(value.underling);
        value.underling = underling;
      }
    }
  }
  return newArray;
}