/**
 * Inserta nuevas columnas logicas a tablas ya existentes.
 */

const ARRNEWLAN = ["es", "ca", "en", "pt", "it", "fr", "de"];
const LANGORIGIN = "es";
const TABNAME = "virtualcon";
const COLDESARR = [
  {
    col_name: "taptfluj",
    col_memo: "Fujos financieros (taptfluj)",
    col_desc: "Fujos financieros (taptfluj)",
    col_info: "",
  },
];

/* Don't touch */
const USER_CODE = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

function translate(data, lang, newlang) {
  try {
    if (lang == newlang) return data;
    return Ax.ext.google.translate.translateText(lang, newlang, data) ?? "";
  } catch (err) {
    return "";
  }
}

COLDESARR.forEach((COLDES) => {
  ARRNEWLAN.forEach((lang) => {
    try {
      const col_memo = translate(COLDES.col_memo, LANGORIGIN, lang);
      Ax.db.insert("wic_jdic_coldata", {
        col_id: 0,
        locale: lang,
        audited: 0,
        tab_name: TABNAME,
        col_name: COLDES.col_name,
        col_memo: col_memo,
        col_desc: translate(COLDES.col_desc, LANGORIGIN, lang),
        col_info: translate(COLDES.col_info, LANGORIGIN, lang),
        user_created: USER_CODE,
        user_updated: USER_CODE,
        date_created: DATE_CURRENT,
        date_updated: DATE_CURRENT,
      });

      console.log("Successfull insert: ", lang, " ,translate: ", col_memo);
    } catch (err) {
      console.log(`Error inserting ${lang}`, err);
      Ax.db.rollbackWork();
    }
  });
});
