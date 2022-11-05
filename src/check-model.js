export const checkModel = (model) => {
  let idents = 0;
  let parens = 0;
  let isCorrect = true;
  model.forEach((str, index) => {
    let trimmed = str.trim();
    switch (trimmed) {
      case "(":
        if (idents !== 1) {
          console.log(
            `Wrong number of idents for new element. Should be 1 was ${idents}`
          );
          isCorrect = false;
        }
        idents--;
        parens++;
        break;
      case ")":
        parens--;
        if (parens < 0) {
          console.log("Parentheses not matched");
          isCorrect = false;
        }
        break;
      case "=":
        if (idents !== 2) {
          console.log(
            `Wrong number of idents for attribute. Should be 2 was ${idents}`
          );
          isCorrect = false;
        }
        idents -= 2;
        break;
      default:
        idents++;
    }
  });

  if (idents !== 0) {
    console.log("Extra idents.");
    isCorrect = false;
  }
  if (parens !== 0) {
    console.log("Parens not matched");
    isCorrect = false;
  }
  if (!isCorrect) {
    console.log(JSON.stringify(model));
  }
  return isCorrect;
};
