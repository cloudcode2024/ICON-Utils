/**
 *  Traduce todos los labels al array de idiomas definidos
 */
const NEWLANGARR = ["ca", "en", "it", "de", "fr", "pt"];

/** Don't touch */
const USER_CODE = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

function translate(data, lang) {
  try {
    return Ax.ext.google.translate.translateText("es", lang, data) ?? "";
  } catch (err) {
    return "";
  }
}

NEWLANGARR.forEach((NEWLANG) => {
  console.log(`--------------------- ${NEWLANG} ---------------------`);
  let mRsDetalle = Ax.db.executeQuery(`
        SELECT
            '${NEWLANG}' locale_tar, locale, label_code, label_name, label_tooltip
        FROM wic_obj_base_text_label
        WHERE locale = 'es'
                AND NOT EXISTS (SELECT label_code 
                                  FROM wic_obj_base_text_label t 
                                 WHERE t.label_code = wic_obj_base_text_label.label_code 
                                   AND t.locale='${NEWLANG}')
        ORDER BY label_code
    `);

  mRsDetalle.forEach((data) => {
    try {
      Ax.db.beginWork();

      if (!data.label_name) return;

      let memo_translate = translate(data.label_name, NEWLANG).toString();
      data.label_name =
        memo_translate[0].toUpperCase() + memo_translate.slice(1);

      if (data.label_tooltip) {
        let desc_translate = translate(data.label_tooltip, NEWLANG);
        data.label_tooltip = desc_translate
          ? desc_translate[0].toUpperCase() + desc_translate.slice(1)
          : data.label_tooltip;
      }

      Ax.db.insert("wic_obj_base_text_label", {
        locale: NEWLANG,
        label_code: data.label_code,
        label_name: data.label_name,
        label_tooltip: data.label_tooltip,
        user_created: USER_CODE,
        user_updated: USER_CODE,
        date_created: DATE_CURRENT,
        date_updated: DATE_CURRENT,
      });

      Ax.db.commitWork();
      console.log("Successfull translating:", data.label_code);
    } catch (err) {
      console.log("Error translating:", err);
      Ax.db.rollbackWork();
    }
  });
});
