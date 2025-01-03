/**
 *  Traduce todos los input query notes al array de idiomas definidos
 */
const ARRAYNEWLANGS = ["en", "ca", "pt", "fr", "it", "de"];

/** Don't touch */
const USER_CODE = Ax.ext.user.getCode();
const DATE_CURRENT = new Ax.util.Date();

function translate(data, newLang) {
  try {
    return Ax.ext.google.translate.translateText("es", newLang, data) ?? "";
  } catch (err) {
    return "";
  }
}

ARRAYNEWLANGS.forEach((NEWLANG) => {
  console.log(`-----------------${NEWLANG}-----------------`);
  
  let mRsDetalle = Ax.db.executeQuery(`
        SELECT '${NEWLANG}' locale_tar,
            wic_obj_base_inputqry_note.locale,
            wic_obj_base_inputqry_note.audited,
            wic_obj_base_inputqry_note.obj_code,
            wic_obj_base_inputqry_note.obj_note
          FROM wic_obj_base_inputqry_note
         WHERE wic_obj_base_inputqry_note.locale = 'es' AND 
                NOT EXISTS (SELECT locale 
                              FROM wic_obj_base_inputqry_note t 
                             WHERE t.obj_code = wic_obj_base_inputqry_note.obj_code
                               AND t.locale='${NEWLANG}')
    `);

  mRsDetalle.forEach((data) => {
    try {
      Ax.db.beginWork();

      if (!data.obj_note) return;

      let memo_translate = translate(data.obj_note, NEWLANG).toString();
      data.obj_note = memo_translate[0].toUpperCase() + memo_translate.slice(1);

      Ax.db.insert("wic_obj_base_inputqry_note", {
        locale      : NEWLANG,
        obj_code    : data.obj_code,
        obj_note    : data.obj_note,
        user_created: USER_CODE,
        user_updated: USER_CODE,
        date_created: DATE_CURRENT,
        date_updated: DATE_CURRENT,
      });

      Ax.db.commitWork();
      console.log(`Successfull translating(${NEWLANG}):`, data.obj_code);
    } catch (err) {
      console.log(`Error translating(${NEWLANG}):`, err);
      Ax.db.rollbackWork();
    }
  });
});
